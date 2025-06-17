import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-amber-600 dark:text-amber-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            🗺️ クエストが見つかりません
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            🏰 ギルド掲示板に戻る
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>冒険者よ、正しい道を見つけて再び挑戦しよう！</p>
        </div>
      </div>
    </div>
  )
}