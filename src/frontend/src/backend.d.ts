import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ProductInput {
    name: string;
    imageUrl: string;
    price: bigint;
}
export interface Product {
    id: bigint;
    name: string;
    imageUrl: string;
    price: bigint;
}
export interface backendInterface {
    addProduct(productInput: ProductInput): Promise<Product>;
    deleteProduct(id: bigint): Promise<boolean>;
    getAllProducts(): Promise<Array<Product>>;
    getProduct(id: bigint): Promise<Product>;
    updateProduct(product: Product): Promise<Product>;
}
