// Source - https://stackoverflow.com/a
// Posted by Bash
// Retrieved 2025-11-15, License - CC BY-SA 4.0

const Navbar = () => {
  return (
    <nav className="navbar bg-teal-400 font-sans h-12 flex justify-center items-center fixed w-full">
      <Link href="/" className="text-white text-4xl font-bold">Company Name</Link>

      <ul className="nav-items flex list-none justify-center items-center w-3/4">
        {navItems.map((item) => (
          <NavLink key={item.id} item={item} />
        ))}
      </ul>

      <button className="border-none text-white font-bold px-4 py-1">Logout</button>
    </nav>
  )
}

export default Navbar
