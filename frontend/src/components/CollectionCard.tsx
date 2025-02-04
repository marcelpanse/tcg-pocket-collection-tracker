import { useState } from 'react';
import { FaMinus } from 'react-icons/fa';
import type { Pokemon } from '@/types/pokemon';

export function CollectionCard(pokemon: Pokemon) {
    const [counter, setCounter] = useState(pokemon.counter || 0);

    const incrementCounter = () => {
        setCounter(counter + 1);
    };

    const decrementCounter = () => {
        if (counter > 0) setCounter(counter - 1);
    };

    return (
        <article className='relative group overflow-hidden w-full h-full rounded-lg'>
            <button className='cursor-pointer w-full h-full'>
                <img onClick={incrementCounter} src={pokemon.image} alt="" className={`${counter === 0 ? 'grayscale' : ''} w-full h-full transition ease-in-out duration-100`} />
            </button>
            <button onClick={decrementCounter} className="absolute cursor-pointer top-0 left-0 inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-purple-600 to-blue-500 hover:from-purple-600 hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                    <span className="px-3 py-3 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full hover:bg-transparent hover:dark:bg-transparent">
                        <FaMinus />
                    </span>
                </button> 
            <div className="absolute bottom-0 w-full h-1/6 bg-black/70 flex items-center justify-center transition-transform transform translate-y-full group-hover:translate-y-0">
                <h1 className="text-white text-lg">{counter}</h1>
            </div>
        </article>
    );
}