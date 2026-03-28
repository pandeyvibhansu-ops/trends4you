import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    imageUrl : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  type ProductInput = {
    name : Text;
    price : Nat;
    imageUrl : Text;
  };

  var nextProductId = 6;

  let products = Map.fromIter<Nat, Product>([
    (1, { id = 1; name = "T-Shirt"; price = 499; imageUrl = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80" }),
    (2, { id = 2; name = "Jeans"; price = 1299; imageUrl = "https://images.unsplash.com/photo-1516769189112-ef73b40fe985?auto=format&fit=crop&w=300&q=80" }),
    (3, { id = 3; name = "Sneakers"; price = 2999; imageUrl = "https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=300&q=80" }),
    (4, { id = 4; name = "Jacket"; price = 1999; imageUrl = "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=80" }),
    (5, { id = 5; name = "Cap"; price = 299; imageUrl = "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=300&q=80" }),
  ].values());
 
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product with id " # id.toText() # " does not exist") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func addProduct(productInput : ProductInput) : async Product {
    let product : Product = {
      id = nextProductId;
      name = productInput.name;
      price = productInput.price;
      imageUrl = productInput.imageUrl;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(product : Product) : async Product {
    if (not products.containsKey(product.id)) {
      Runtime.trap("Product with id " # product.id.toText() # " does not exist");
    };
    products.add(product.id, product);
    product;
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async Bool {
    if (not products.containsKey(id)) {
      Runtime.trap("Product with id " # id.toText() # " does not exist");
    };
    products.remove(id);
    true;
  };
};
