from flask import Flask, request, jsonify
from flask_cors import CORS

from transformers import BertTokenizer, BertModel
import torch
import numpy as np
from faiss import IndexFlatL2

from firebase_admin import credentials, firestore
import firebase_admin

import os
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firestore client
cred = credentials.Certificate("YOUR_PRIVATE_KEY")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# Check if CUDA is available and set the device accordingly
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
model.to(device)

def get_product_embedding(product_id):
    # Fetch the product embedding from the Firestore collection
    product_doc = db.collection('products_reduced').document(f'product{product_id}').get()
    if product_doc.exists:
        product = product_doc.to_dict()
        return np.array(product['embeddings'])
    return None

def log_user_circumstances(search: str, userID: int=1):
    # Define the data to be logged
    data = {
        'userID': userID,
        'type': 'search',
        'search': search,
        'timestamp': firestore.SERVER_TIMESTAMP
    }
    
    # Insert the data into the Firestore collection
    db.collection('user_searches').add(data)
    print(f"Logged search for user {userID}: {search}")

def log_product_click(productID: str, userID: int=1):
    # Define the data to be logged
    data = {
        'userID': userID,
        'type': 'click',
        'productID': productID,
        'timestamp': firestore.SERVER_TIMESTAMP
    }
    
    # Insert the data into the Firestore collection
    db.collection('user_searches').add(data)
    print(f"Logged click for user {userID} on product {productID}")

def fetch_products_batch(batch_size=1000, start_after=None):
    """ Fetch products from Firestore in batches """
    query = db.collection('products_reduced').limit(batch_size)
    if start_after:
        query = query.start_after(start_after)
    docs = query.stream()
    products = []
    last_doc = None
    for doc in docs:
        product = doc.to_dict()
        product['id'] = doc.id
        product['embeddings'] = np.array(product['embeddings'])  # Convert to numpy array
        products.append(product)
        last_doc = doc
    return products, last_doc

def build_faiss_index(batch_size=1000):
    all_products = []
    index = None
    last_doc = None
    first_batch = True
    batch_num = 1
    while True:
        # if batch_num == 2:
          # break
        products, last_doc = fetch_products_batch(batch_size, last_doc)
        if not products:
            break
        embeddings = np.array([product['embeddings'] for product in products])
        print(f"Batch {batch_num} - Fetched {len(products)} products with embeddings shape: {embeddings.shape}")
        if first_batch:
            d = embeddings.shape[1]
            index = IndexFlatL2(d)  # Initialize the index
            first_batch = False
        index.add(embeddings)  # Add the embeddings to the index
        batch_num += 1
        all_products.extend(products)
    return all_products, index

def encode_text(text):
    inputs = tokenizer(text, return_tensors='pt', max_length=512, truncation=True, padding='max_length')
    input_ids = inputs['input_ids'].to(device)
    attention_mask = inputs['attention_mask'].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)

    embeddings = outputs.last_hidden_state[:, 0, :].squeeze().cpu().numpy()
    return embeddings

def rank_products_with_faiss_search(search_embedding, index, products, top_n=5):
    D, I = index.search(np.array([search_embedding]), top_n)
    return [
        {
            'productID': products[i]['productID'],
            'name': products[i]['name'],
            'main_category': products[i]['main_category'],
            'sub_category': products[i]['sub_category'],
            'actual_price': f"SGD {products[i]['actual_price']}",
            'discount_price': f"SGD {products[i]['discount_price']}",
        } for i in I[0]
    ]

def rank_products_with_faiss_click(product_embedding, index, products, top_n=5):
    D, I = index.search(np.array([product_embedding]), top_n)
    return [
        {
            'productID': products[i]['productID'],
            'name': products[i]['name'],
            'main_category': products[i]['main_category'],
            'sub_category': products[i]['sub_category'],
            'actual_price': f"SGD {products[i]['actual_price']}",
            'discount_price': f"SGD {products[i]['discount_price']}",
        } for i in I[0]
    ]

# We will build the index and fetch the products when the server starts
products, index = build_faiss_index()

print(len(products))

@app.route('/recommend/<user_id>', methods=['GET'])
def recommend(user_id:int=1):
    # Fetch latest interaction data for the user from user_searches collection
    user_id = int(user_id)
    query = db.collection('user_searches').where('userID', '==', user_id).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(3)
    docs = query.stream()

    recommendations = []

    for doc in docs:
        interaction = doc.to_dict()
        interaction_type = interaction.get('type', '') 

        if interaction_type == 'search':
            search_embedding = encode_text(interaction['search'])
            recommended_products = rank_products_with_faiss_search(search_embedding, index, products, top_n=3)
        elif interaction_type == 'click':
            # Assuming you have a function to get product embeddings from product ID
            product_embedding = get_product_embedding(interaction['productID'])
            recommended_products = rank_products_with_faiss_click(product_embedding, index, products, top_n=3)
        else:
            continue
        
        recommendations.extend(recommended_products)

    # Remove duplicates while preserving order
    seen = set()
    recommendations = [x for x in recommendations if x['productID'] not in seen and not seen.add(x['productID'])]

    # Limit to top 3 recommendations
    random.shuffle(recommendations)
    recommendations = recommendations[:3]

    return jsonify({
        'products': recommendations
    })  



@app.route('/search', methods=['POST'])
def search():
    data = request.json

    if data is None:
        return jsonify({"error": "Request payload is not in JSON format"}), 400

    search_query = data.get('query', '')
    
    if not search_query:
        return jsonify({"error": "Query is required"}), 400
    
    log_user_circumstances(search_query, 1)

    search_embedding = encode_text(search_query)
    ranked_products = rank_products_with_faiss_search(search_embedding, index, products)
    return jsonify({
        'products': ranked_products
    })

@app.route('/click', methods=['POST'])
def click():
    data = request.json

    if data is None:
        return jsonify({"error": "Request payload is not in JSON format"}), 400

    product_id = data.get('productID', '')
    
    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400

    product = next((p for p in products if p['productID'] == product_id), None)
    if product is None:
        return jsonify({"error": "Product not found"}), 404
    
    log_product_click(product_id, 1)

    # product_embedding = product['embeddings']
    # ranked_products = rank_products_with_faiss_click(product_embedding, index, products)
    # return jsonify({
     #    'products': ranked_products
    # })
    return jsonify({
        'status': 'OK',
    }), 200

@app.route('/product/<product_id>', methods=['GET'])
def get_product(product_id):
    product_ref = db.collection('products_reduced').document(f'product{product_id}')
    product = product_ref.get().to_dict()
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

if __name__ == '__main__':
    # Set the environment variable to avoid multiple OpenMP runtime initialization issue
    os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'
    app.run(host='127.0.0.1', port=5000)