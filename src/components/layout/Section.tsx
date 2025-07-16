export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto mt-10">{children}</section>
  )
}
