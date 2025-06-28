
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-6xl font-bold text-green-600">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página Não Encontrada</h2>
      <p className="mt-2 text-lg text-center max-w-md">A página que você está procurando não existe ou foi movida.</p>
      <Link href="/" className="mt-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}


