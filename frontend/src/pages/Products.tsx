import { useState, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { getCategories, type ProductFilters } from '@/services/api'
import ProductGrid from '@/components/products/ProductGrid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import {
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  DollarSign,
  Star,
  Grid3X3,
  LayoutGrid,
  Layers,
} from 'lucide-react'
import { ErrorState } from '@/components/ui/error-state'
import { PageHeader, PageHeaderBadge } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'

// Helper to parse filters from URL
const parseFiltersFromParams = (searchParams: URLSearchParams): ProductFilters => {
  const filters: ProductFilters = {}

  const search = searchParams.get('search')
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') as ProductFilters['sort']
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const featured = searchParams.get('featured')

  if (search) filters.search = search
  if (category) filters.category = category
  if (sort) filters.sort = sort
  if (minPrice) filters.minPrice = Number(minPrice)
  if (maxPrice) filters.maxPrice = Number(maxPrice)
  if (featured === 'true') filters.featured = true

  return filters
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<ProductFilters>(() => parseFiltersFromParams(searchParams))
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || 0,
    Number(searchParams.get('maxPrice')) || 500,
  ])
  const [viewMode, setViewMode] = useState<'grid' | 'large'>(
    (searchParams.get('view') as 'grid' | 'large') || 'grid'
  )

  // Sync URL params to filters state when URL changes (e.g., from navbar navigation)
  useEffect(() => {
    const newFilters = parseFiltersFromParams(searchParams)
    setFilters(newFilters)
    setSearch(searchParams.get('search') || '')
    setPriceRange([
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 500,
    ])
    setViewMode((searchParams.get('view') as 'grid' | 'large') || 'grid')
  }, [searchParams])

  // Sync filters to URL
  const syncFiltersToUrl = useCallback((newFilters: ProductFilters, view?: 'grid' | 'large') => {
    const params = new URLSearchParams()

    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.sort) params.set('sort', newFilters.sort)
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
    if (newFilters.featured) params.set('featured', 'true')
    if (view && view !== 'grid') params.set('view', view)

    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (data) => data.data,
  })

  const { data, isLoading, error } = useProducts(filters)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newFilters = { ...filters, search: search || undefined }
    if (!search) delete newFilters.search
    setFilters(newFilters)
    syncFiltersToUrl(newFilters, viewMode)
  }

  const clearSearch = () => {
    setSearch('')
    const newFilters = { ...filters }
    delete newFilters.search
    setFilters(newFilters)
    syncFiltersToUrl(newFilters, viewMode)
  }

  const updateFilter = (
    key: keyof ProductFilters,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      if (value === undefined || value === '' || value === 'all') {
        delete newFilters[key]
      } else {
        newFilters[key] = value as never
      }
      syncFiltersToUrl(newFilters, viewMode)
      return newFilters
    })
  }

  const applyPriceRange = () => {
    const newFilters = {
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
    }
    if (!newFilters.minPrice) delete newFilters.minPrice
    if (!newFilters.maxPrice) delete newFilters.maxPrice
    setFilters(newFilters)
    syncFiltersToUrl(newFilters, viewMode)
  }

  const clearPriceRange = () => {
    setPriceRange([0, 500])
    const newFilters = { ...filters }
    delete newFilters.minPrice
    delete newFilters.maxPrice
    setFilters(newFilters)
    syncFiltersToUrl(newFilters, viewMode)
  }

  const clearAllFilters = () => {
    setSearch('')
    setFilters({})
    setPriceRange([0, 500])
    syncFiltersToUrl({}, viewMode)
  }

  const handleViewModeChange = (mode: 'grid' | 'large') => {
    setViewMode(mode)
    syncFiltersToUrl(filters, mode)
  }

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== 'sort'
  ).length

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c) => c.id === categoryId)?.name || categoryId
  }

  // Get the selected category object
  const selectedCategory = filters.category
    ? categories?.find((c) => c.id === filters.category)
    : null

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHeader
        badge={
          selectedCategory ? (
            <PageHeaderBadge icon={<Layers className="h-4 w-4" />}>
              Collection
            </PageHeaderBadge>
          ) : (
            <PageHeaderBadge icon={<Sparkles className="h-4 w-4" />}>
              Curated Collection
            </PageHeaderBadge>
          )
        }
        title={selectedCategory ? selectedCategory.name : 'Discover Products'}
        description={
          selectedCategory
            ? selectedCategory.description
            : 'Explore our handpicked selection of premium products'
        }
      />

      {/* Filter Bar */}
      <section className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4">
          {/* Main Filter Row */}
          <div className="flex items-center gap-2 sm:gap-3 py-3 overflow-x-auto scrollbar-hide">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-[140px] sm:w-[200px] md:w-[280px] pl-9 pr-8 rounded-full text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            <div className="hidden sm:block h-6 w-px bg-border flex-shrink-0" />

            {/* Category Pills - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Button
                variant={!filters.category ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('category', undefined)}
                className="h-8 rounded-full text-xs"
              >
                All
              </Button>
              {categories?.slice(0, 4).map((category) => (
                <Button
                  key={category.id}
                  variant={filters.category === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('category', category.id)}
                  className="h-8 rounded-full text-xs whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Category Select - Mobile only */}
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => updateFilter('category', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="md:hidden h-8 w-[100px] rounded-full text-xs flex-shrink-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden sm:block h-6 w-px bg-border flex-shrink-0" />

            {/* Price Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={filters.minPrice || filters.maxPrice ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 rounded-full text-xs gap-1.5 flex-shrink-0"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Price</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Price Range</span>
                    {(filters.minPrice || filters.maxPrice) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearPriceRange}
                        className="h-6 text-xs text-muted-foreground"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={500}
                    step={10}
                    className="mt-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">${priceRange[0]}</span>
                    <span className="text-muted-foreground">${priceRange[1]}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={applyPriceRange}
                    className="w-full h-8 rounded-full"
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Featured Filter */}
            <Button
              variant={filters.featured ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilter('featured', filters.featured ? undefined : true)}
              className="h-8 rounded-full text-xs gap-1.5 flex-shrink-0"
            >
              <Star className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Featured</span>
            </Button>

            <div className="flex-1 min-w-2" />

            {/* Sort */}
            <Select
              value={filters.sort || 'default'}
              onValueChange={(value) =>
                updateFilter(
                  'sort',
                  value === 'default' ? undefined : (value as ProductFilters['sort'])
                )
              }
            >
              <SelectTrigger className="h-8 w-[110px] sm:w-[150px] rounded-full text-xs flex-shrink-0">
                <ArrowUpDown className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline"><SelectValue placeholder="Sort" /></span>
                <span className="sm:hidden">Sort</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle - Hidden on mobile */}
            <div className="hidden sm:flex items-center rounded-full border border-border p-0.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewModeChange('grid')}
                className={cn(
                  'h-7 w-7 rounded-full',
                  viewMode === 'grid' && 'bg-secondary'
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewModeChange('large')}
                className={cn(
                  'h-7 w-7 rounded-full',
                  viewMode === 'large' && 'bg-secondary'
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pb-3 overflow-x-auto">
              <span className="text-xs text-muted-foreground flex-shrink-0">
                Active filters:
              </span>
              {filters.search && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full pl-2 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={clearSearch}
                >
                  Search: {filters.search}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {filters.category && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full pl-2 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => updateFilter('category', undefined)}
                >
                  {getCategoryName(filters.category)}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full pl-2 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={clearPriceRange}
                >
                  ${filters.minPrice || 0} - ${filters.maxPrice || 500}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {filters.featured && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full pl-2 pr-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => updateFilter('featured', undefined)}
                >
                  Featured
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        {error ? (
          <ErrorState
            error={error}
            onRetry={() => window.location.reload()}
            className="py-16"
          />
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                {filters.search ? (
                  <h2 className="font-serif text-xl">
                    Results for "{filters.search}"
                  </h2>
                ) : filters.category ? (
                  <h2 className="font-serif text-xl">
                    {getCategoryName(filters.category)}
                  </h2>
                ) : (
                  <h2 className="font-serif text-xl">All Products</h2>
                )}
                {data && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {data.products.length} product{data.products.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Grid */}
            <ProductGrid
              products={data?.products}
              isLoading={isLoading}
              columns={viewMode === 'large' ? 3 : 4}
            />
          </>
        )}
      </section>
    </div>
  )
}
