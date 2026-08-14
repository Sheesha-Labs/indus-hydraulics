import SearchSubTabsNav from './SearchSubTabsNav'

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SearchSubTabsNav />
      {children}
    </div>
  )
}
