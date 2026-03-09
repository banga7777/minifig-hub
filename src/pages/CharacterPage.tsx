import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { starWarsCharacters } from '../services/characterData';
import { StarWarsFamily } from '../services/characterClassifier';
import SEO from '../components/SEO';

const CharacterPage: React.FC = () => {
  const { characterId } = useParams<{ characterId: StarWarsFamily }>();
  const character = starWarsCharacters.find(c => c.id === characterId);

  if (!character) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <SEO title="Character Not Found" description="The requested LEGO character could not be found." />
            <h1 className="text-4xl font-bold text-red-500">Character Not Found</h1>
            <Link to="/" className="mt-4 text-lg text-blue-400 hover:underline">Return to the Hub</Link>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
        <SEO 
            title={`${character.name} | LEGO Character Hub`}
            description={character.description}
            image={character.imageUrl}
        />
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="text-blue-400 hover:underline mb-8 block">&larr; Back to Character Hub</Link>
            <div className="bg-gray-800 rounded-lg overflow-hidden md:flex">
                <img src={character.imageUrl} alt={character.name} className="w-full md:w-1/2 h-auto object-cover"/>
                <div className="p-8">
                    <h1 className="text-5xl font-bold mb-4 text-red-500">{character.name}</h1>
                    <p className="text-xl text-gray-300">{character.description}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CharacterPage;
