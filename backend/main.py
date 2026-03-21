from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your Vite frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Jai Mata Di Hardware API"}

@app.get("/api/products")
def get_products():
    return [
        {"id": 1, "name": "Premium Bi-Metal Hacksaw Blade", "category": "Cutting Tools", "sku": "HB-201"},
        {"id": 2, "name": "Brass Angle Valve (Heavy Duty)", "category": "Bathroom Fittings", "sku": "BF-405"},
        {"id": 3, "name": "Stainless Steel Shower Head", "category": "Bathroom Fittings", "sku": "BF-406"},
        {"id": 4, "name": "Carbon Steel Hacksaw Frame", "category": "Cutting Tools", "sku": "HF-101"},
    ]