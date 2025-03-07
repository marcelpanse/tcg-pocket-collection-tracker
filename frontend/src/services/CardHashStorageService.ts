export class CardHashStorageService {
  private static instance: CardHashStorageService
  private db: IDBDatabase | null = null
  private readonly DB_NAME = 'PokemonCardHashes'
  private readonly STORE_NAME = 'cardHashes'

  private constructor() {}

  public static getInstance(): CardHashStorageService {
    if (!CardHashStorageService.instance) {
      CardHashStorageService.instance = new CardHashStorageService()
    }
    return CardHashStorageService.instance
  }

  public async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  public async storeHashes(hashes: { id: string; hash: string }[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction(this.STORE_NAME, 'readwrite')
    const store = transaction.objectStore(this.STORE_NAME)

    return new Promise((resolve, reject) => {
      for (const hash of hashes) {
        store.put(hash)
      }
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  public async getAllHashes(): Promise<{ id: string; hash: string }[]> {
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction(this.STORE_NAME, 'readonly')
    const store = transaction.objectStore(this.STORE_NAME)
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  public async getHashCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction(this.STORE_NAME, 'readonly')
    const store = transaction.objectStore(this.STORE_NAME)
    const request = store.count()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}
