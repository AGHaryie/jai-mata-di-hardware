import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DATABASE MODELS ---
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category = Column(String)
    sku = Column(String)
    image_url = Column(String)

class DBInquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String)
    sku = Column(String)
    customer_name = Column(String)
    customer_phone = Column(String)

# --- PYDANTIC SCHEMAS (For incoming POST requests) ---
class InquiryCreate(BaseModel):
    product_name: str
    sku: str
    customer_name: str
    customer_phone: str

class ProductBase(BaseModel):
    name: str
    category: str
    sku: str
    image_url: str | None = None  # The "| None" means it's optional

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- API ROUTES ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Jai Mata Di Hardware API"}

@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products

# NEW: Route to save inquiries
@app.post("/api/inquiries")
def create_inquiry(inquiry: InquiryCreate, db: Session = Depends(get_db)):
    new_inquiry = DBInquiry(
        product_name=inquiry.product_name,
        sku=inquiry.sku,
        customer_name=inquiry.customer_name,
        customer_phone=inquiry.customer_phone
    )
    db.add(new_inquiry)
    db.commit()
    return {"message": "Inquiry saved successfully!"}

# --- ADMIN ROUTES (Add, Edit, Delete Products) ---

# 1. ADD a new product
@app.post("/api/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # Create a new database row using the data sent from React
    new_product = Product(
        name=product.name,
        category=product.category,
        sku=product.sku,
        image_url=product.image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

# 2. EDIT an existing product
@app.put("/api/products/{product_id}")
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    # Find the exact product by its ID
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update the fields
    db_product.name = product.name
    db_product.category = product.category
    db_product.sku = product.sku
    db_product.image_url = product.image_url
        
    db.commit()
    db.refresh(db_product)
    return db_product

# 3. DELETE a product
@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    # Find the product
    db_product = db.query(Product).filter(Product.id == product_id).first()
    
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Delete it from the database
    db.delete(db_product)
    db.commit()
    return {"message": "Product successfully deleted!"}