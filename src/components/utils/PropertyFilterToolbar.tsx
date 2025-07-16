'use client'

import { Filter, Grid, List } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { usePropertyFilterStore, ViewMode } from '@/stores/propertyFilterStore'

const categories = ['High-Rise', 'Landed']
const locations = ['Johor Bahru', 'Iskandar Puteri', 'Pasir Gudang']
const hardMax = 6000000
const defaultMin = 50000
const defaultMax = 1000000

const propertyTypeByCategory: Record<string, string[]> = {
  'High-Rise': ['Apartment', 'Serviced Apartment', 'Condominium', 'Studio', 'Penthouse', 'Duplex/Loft'],
  'Landed': [
    'Single Storey Terrace House',
    'Double Storey Terrace House',
    'Triple Storey Terrace House',
    'Cluster House',
    'Semi-Detached House',
    'Bungalow',
    'Superlink House',
    'Townhouse'
  ]
}

export default function PropertyToolbar() {
  const store = usePropertyFilterStore()
  const [isOpen, setIsOpen] = useState(false)

  const setFilter = store.setFilter
  const currentTypes = store.filters.category
    ? propertyTypeByCategory[store.filters.category] || []
    : Object.values(propertyTypeByCategory).flat()

  const priceRange = [store.filters.minPrice, store.filters.maxPrice]

  return (
    <section className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl p-4 shadow-lg space-y-4 mt-5">

      {/* Toggle View / Filters for Mobile */}
      <div className="flex justify-between items-center md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-primary/90 hover:bg-primary text-white rounded text-sm font-semibold"
        >
          <Filter className="w-4 h-4" />
          {isOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex gap-2">
          <button
            className={`p-2 rounded ${store.view === 'grid' ? 'bg-primary text-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            onClick={() => store.setView('grid')}
          >
            <Grid size={16} />
          </button>
          <button
            className={`p-2 rounded ${store.view === 'list' ? 'bg-primary text-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            onClick={() => store.setView('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block space-y-4 transition-all duration-300`}>

        {/* Search & Sort */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={store.filters.search}
            onChange={e => setFilter('search', e.target.value)}
            placeholder="🔍 Search project name..."
            className="flex-grow min-w-[200px] px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white placeholder:text-zinc-500"
          />
          <select
            value={store.sort}
            onChange={e => store.setSort(e.target.value as any)}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          >
            <option value="newest">🆕 Newest First</option>
            <option value="priceAsc">⬆️ Price: Low → High</option>
            <option value="priceDesc">⬇️ Price: High → Low</option>
          </select>
        </div>

        {/* Category / Type / Location / Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={store.filters.category}
            onChange={e => {
              setFilter('category', e.target.value)
              setFilter('type', '') // reset type
            }}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          >
            <option value="">🏷️ Category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={store.filters.type}
            onChange={e => setFilter('type', e.target.value)}
            disabled={!store.filters.category}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          >
            <option value="">🏠 Property Type</option>
            {currentTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={store.filters.location}
            onChange={e => setFilter('location', e.target.value)}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          >
            <option value="">📍 Location</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select
            value={store.filters.rooms}
            onChange={e => setFilter('rooms', Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
          >
            <option value={0}>🛏️ Rooms</option>
            {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Room{r > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        {/* Price Range + Inputs */}
        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg space-y-3">
            <label className="text-sm font-semibold mb-2 block">💰 Price Range (RM)</label>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Inputs beside slider */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="Min"
                        value={store.filters.minPrice || ''}
                        onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        const val = Number(raw)
                        if (!isNaN(val)) setFilter('minPrice', Math.min(val, store.filters.maxPrice))
                        }}
                        onBlur={(e) => {
                        if (e.target.value === '') setFilter('minPrice', defaultMin)
                        }}
                        className="w-28 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-900"
                    />
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d*"
                        placeholder="Max"
                        value={store.filters.maxPrice || ''}
                        onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '')
                        const val = Number(raw)
                        if (!isNaN(val)) {
                            const clamped = Math.max(store.filters.minPrice, Math.min(val, hardMax))
                            setFilter('maxPrice', clamped)
                        }
                        }}
                        onBlur={(e) => {
                        if (e.target.value === '') setFilter('maxPrice', defaultMax)
                        }}
                        className="w-28 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-900"
                    />
                </div>

                {/* Slider beside inputs */}
                <div className="flex-grow w-full">
                    <Slider
                        min={0}
                        max={hardMax}
                        step={1000}
                        value={[store.filters.minPrice, store.filters.maxPrice]}
                        onValueChange={([min, max]) => {
                        setFilter('minPrice', min)
                        setFilter('maxPrice', max)
                        }}
                    />
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">
                        RM{store.filters.minPrice.toLocaleString()} – RM{store.filters.maxPrice.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>


        {/* Clear Filters */}
        <div className="flex justify-end">
          <button
            onClick={store.clearFilters}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
          >
            ✨ Clear All Filters
          </button>
        </div>
      </div>
    </section>
  )
}