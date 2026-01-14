import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../data/products';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onImageClick: (product: Product) => void;
}

/**
 * Product card component displaying product information and add-to-cart button
 */
export default function ProductCard({ product, onAddToCart, onImageClick }: ProductCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100">
            {/* Product Image */}
            <div
                className={`aspect-square rounded-xl ${product.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden cursor-pointer`}
                onClick={() => onImageClick(product)}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                />
                {/* Badge for 'Best Seller' */}
                {product.bestSeller && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-full text-emerald-700 shadow-sm">
                        Best Seller
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight">{product.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{product.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="font-bold text-xl text-slate-900">${product.price.toFixed(2)}</span>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
