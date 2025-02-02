interface CategoryChipsProps {
  categories: string[]
  selectedCategories: string[]
  onToggle: (category: string) => void
}

export default function CategoryChips({ categories, selectedCategories, onToggle }: CategoryChipsProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Select Categories</label>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onToggle(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategories.includes(category)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

