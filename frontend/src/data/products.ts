// Import product images
import frogClassic from '../product-images/frog-classic.png';
import frogBusiness from '../product-images/frog-business.png';
import frogZen from '../product-images/frog-zen.png';
import frogParty from '../product-images/frog-party.png';
import frogHolmes from '../product-images/frog-holmes.png';
import frogPunk from '../product-images/frog-punk.png';
import frogAstro from '../product-images/frog-astro.png';
import frogUnicorn from '../product-images/frog-unicorn.png';

export interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    color: string;
    image: string;
    bestSeller: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

// Product catalog
export const PRODUCTS: Product[] = [
    {
        id: 1,
        name: 'The Classic Green',
        price: 0.25,
        description: 'The original timeless rubber frog. Squeaks when squeezed.',
        color: 'bg-green-100',
        image: frogClassic,
        bestSeller: false
    },
    {
        id: 2,
        name: 'Business Frog',
        price: 0.50,
        description: 'Ready for the boardroom. Comes with a tiny attached tie.',
        color: 'bg-blue-100',
        image: frogBusiness,
        bestSeller: false
    },
    {
        id: 3,
        name: 'Zen Master',
        price: 0.25,
        description: 'Find inner peace with this meditating amphibian.',
        color: 'bg-emerald-100',
        image: frogZen,
        bestSeller: true
    },
    {
        id: 4,
        name: 'Party Frog',
        price: 0.25,
        description: 'The life of the pond. Glitter finish and party hat included.',
        color: 'bg-purple-100',
        image: frogParty,
        bestSeller: false
    },
    {
        id: 5,
        name: 'Sherlock Hopps',
        price: 0.50,
        description: 'Solves pond mysteries. Comes with a magnifying glass.',
        color: 'bg-amber-100',
        image: frogHolmes,
        bestSeller: true
    },
    {
        id: 6,
        name: 'Punk Rock Toad',
        price: 0.25,
        description: "It's not a phase, mom. Features a rubber mohawk.",
        color: 'bg-rose-100',
        image: frogPunk,
        bestSeller: false
    },
    {
        id: 7,
        name: 'Astro-Amphibian',
        price: 0.50,
        description: 'One small hop for frog, one giant leap for frogkind.',
        color: 'bg-slate-200',
        image: frogAstro,
        bestSeller: false
    },
    {
        id: 10,
        name: 'The Uni-Frog',
        price: 0.25,
        description: 'The rarest of them all. Majestic golden horn included.',
        color: 'bg-pink-100',
        image: frogUnicorn,
        bestSeller: false
    }
];
