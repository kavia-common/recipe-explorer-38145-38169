import { useEffect, useMemo, useRef, useState } from 'react';
import { useTizenKeys } from './hooks/useTizenKeys';
import './App.css';

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Recipe Explorer - Ocean Professional themed UI
   * - Top navigation with search
   * - Sidebar with categories
   * - Recipe grid (cards)
   * - Detail view (modal)
   * Uses local mock data, keyboard navigation for Tizen remote keys.
   */
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [focusRegion, setFocusRegion] = useState('grid'); // 'sidebar' | 'grid' | 'search' | 'detail'
  const [gridIndex, setGridIndex] = useState(0);
  const [sidebarIndex, setSidebarIndex] = useState(0);

  const searchInputRef = useRef(null);

  // Load mock data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/mock-data/recipes.json');
        const data = await res.json();
        setRecipes(data);
        const cats = Array.from(new Set(data.flatMap(r => r.categories || []))).sort();
        setCategories(['All', ...cats]);
      } catch (e) {
        console.error('Failed to load recipes:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = recipes;
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(r => (r.categories || []).includes(selectedCategory));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.ingredients || []).some(i => i.toLowerCase().includes(q))
      );
    }
    return list;
  }, [recipes, selectedCategory, query]);

  useEffect(() => {
    // Reset focus indices when filters change
    setGridIndex(0);
  }, [selectedCategory, query]);

  // Keyboard handling for Tizen remote
  useTizenKeys({
    onLeft: () => {
      if (focusRegion === 'grid') {
        setGridIndex(i => Math.max(0, i - 1));
      } else if (focusRegion === 'search') {
        setFocusRegion('sidebar');
      } else if (focusRegion === 'detail') {
        // noop inside modal
      } else {
        // sidebar: stay
      }
    },
    onRight: () => {
      if (focusRegion === 'grid') {
        setGridIndex(i => Math.min(filtered.length - 1, i + 1));
      } else if (focusRegion === 'sidebar') {
        setFocusRegion('grid');
      } else if (focusRegion === 'detail') {
        // noop
      } else {
        // search -> grid to quickly browse
        setFocusRegion('grid');
      }
    },
    onUp: () => {
      if (focusRegion === 'grid') {
        // Move up a row based on column count
        const cols = computeColumns();
        setGridIndex(i => Math.max(0, i - cols));
      } else if (focusRegion === 'sidebar') {
        setSidebarIndex(i => Math.max(0, i - 1));
      } else if (focusRegion === 'detail') {
        // noop
      } else if (focusRegion === 'search') {
        setFocusRegion('sidebar');
      }
    },
    onDown: () => {
      if (focusRegion === 'grid') {
        const cols = computeColumns();
        setGridIndex(i => Math.min(filtered.length - 1, i + cols));
      } else if (focusRegion === 'sidebar') {
        setSidebarIndex(i => Math.min(categories.length - 1, i + 1));
      } else if (focusRegion === 'search') {
        setFocusRegion('grid');
      }
    },
    onEnter: () => {
      if (focusRegion === 'sidebar') {
        const cat = categories[sidebarIndex];
        setSelectedCategory(cat);
        setFocusRegion('grid');
      } else if (focusRegion === 'grid') {
        const r = filtered[gridIndex];
        if (r) {
          setSelectedRecipe(r);
          setFocusRegion('detail');
        }
      } else if (focusRegion === 'search') {
        // submit is implicit: keep focus
      } else if (focusRegion === 'detail') {
        // close detail on enter as a simple action
        setSelectedRecipe(null);
        setFocusRegion('grid');
      }
    },
    onBack: () => {
      if (focusRegion === 'detail' && selectedRecipe) {
        setSelectedRecipe(null);
        setFocusRegion('grid');
      } else if (query) {
        setQuery('');
      } else if (selectedCategory !== 'All') {
        setSelectedCategory('All');
      } else {
        // At root; optionally log or ignore to avoid closing preview
        console.log('Back pressed at root');
      }
    },
  });

  function computeColumns() {
    // For 1920x1080 target; make responsive using card width + gap
    // We simulate responsive by calculating based on container width
    const containerWidth = 1600; // approx main area given sidebar width 280 + margins
    const cardWidth = 280;
    const gap = 24;
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
    return cols;
  }

  return (
    <div className="app-shell">
      <TopNav
        value={query}
        onChange={setQuery}
        onFocus={() => {
          setFocusRegion('search');
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }}
        inputRef={searchInputRef}
      />
      <div className="app-body">
        <Sidebar
          categories={categories}
          activeCategory={selectedCategory}
          onSelect={cat => {
            setSelectedCategory(cat);
            setFocusRegion('grid');
          }}
          focusRegion={focusRegion}
          focusedIndex={sidebarIndex}
          setFocusedIndex={setSidebarIndex}
          setFocusRegion={setFocusRegion}
        />
        <main className="main-content" role="main" aria-label="Recipes">
          {loading ? (
            <LoadingState />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <RecipeGrid
              items={filtered}
              focusRegion={focusRegion}
              focusedIndex={gridIndex}
              onFocusIndex={setGridIndex}
              onOpen={setSelectedRecipe}
              setFocusRegion={setFocusRegion}
            />
          )}
        </main>
      </div>
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => {
            setSelectedRecipe(null);
            setFocusRegion('grid');
          }}
        />
      )}
    </div>
  );
}

/** Top Navigation with search input */
// PUBLIC_INTERFACE
function TopNav({ value, onChange, onFocus, inputRef }) {
  return (
    <header className="topnav" role="banner">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">🍳</span>
        <span className="brand-title">Recipe Explorer</span>
      </div>
      <div className="search-wrap">
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder="Search recipes or ingredients..."
          aria-label="Search recipes"
        />
      </div>
    </header>
  );
}

/** Sidebar with categories */
// PUBLIC_INTERFACE
function Sidebar({ categories, activeCategory, onSelect, focusRegion, focusedIndex, setFocusedIndex, setFocusRegion }) {
  return (
    <aside className="sidebar" role="navigation" aria-label="Recipe categories">
      <div className="sidebar-title">Categories</div>
      <ul className="category-list" role="listbox" aria-activedescendant={`cat-${focusedIndex}`}>
        {categories.map((cat, idx) => {
          const active = cat === activeCategory;
          const focused = focusRegion === 'sidebar' && idx === focusedIndex;
          return (
            <li
              id={`cat-${idx}`}
              key={cat}
              className={[
                'category-item',
                active ? 'active' : '',
                focused ? 'focused' : '',
              ].join(' ').trim()}
              role="option"
              aria-selected={active}
              tabIndex={focused ? 0 : -1}
              onMouseEnter={() => setFocusedIndex(idx)}
              onClick={() => {
                onSelect(cat);
                setFocusRegion('grid');
              }}
            >
              <span className="dot" aria-hidden="true" />
              <span className="cat-label">{cat}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

/** Recipe card grid */
// PUBLIC_INTERFACE
function RecipeGrid({ items, focusRegion, focusedIndex, onFocusIndex, onOpen, setFocusRegion }) {
  return (
    <section className="grid" role="grid" aria-label="Recipe results">
      {items.map((r, idx) => {
        const focused = focusRegion === 'grid' && idx === focusedIndex;
        return (
          <article
            key={r.id}
            className={['card', focused ? 'focused' : ''].join(' ').trim()}
            role="button"
            tabIndex={focused ? 0 : -1}
            aria-label={`${r.title}, ${r.time} minutes`}
            onMouseEnter={() => onFocusIndex(idx)}
            onClick={() => {
              onOpen(r);
              setFocusRegion('detail');
            }}
          >
            <div className="card-media" style={{ backgroundImage: `url(${r.image})` }}>
              <div className="time-pill">{r.time}m</div>
            </div>
            <div className="card-body">
              <h3 className="card-title">{r.title}</h3>
              <p className="card-meta">{(r.categories || []).join(' · ')}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}

/** Detail modal */
// PUBLIC_INTERFACE
function RecipeDetail({ recipe, onClose }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Recipe details for ${recipe.title}`}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">{recipe.title}</h2>
            <span className="modal-time">{recipe.time} minutes</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close details">✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-media" style={{ backgroundImage: `url(${recipe.image})` }} />
          <div className="modal-content">
            <section>
              <h3>Ingredients</h3>
              <ul className="ingredients">
                {(recipe.ingredients || []).map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </section>
            <section>
              <h3>Steps</h3>
              <ol className="steps">
                {(recipe.steps || []).map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Simple states */
function LoadingState() {
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div>Loading recipes...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="state" role="status" aria-live="polite">
      <div>No recipes found</div>
      <div className="state-sub">Try adjusting your search or filters.</div>
    </div>
  );
}
