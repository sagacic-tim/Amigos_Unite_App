// Source - https://stackoverflow.com/a
// Posted by Bash
// Retrieved 2025-11-15, License - CC BY-SA 4.0

const NavLink = ({item}) => {
  return (
    <li
      className='group flex items-center text-gray-200 mx-6 font-semibold hover:text-white h-12'
    >
      <Link href={item.path}>{item.title}</Link>
      
      {item.children && (
        <ul className='group-hover:block hidden w-36 absolute list-none text-start top-12 bg-sky-300'>
          {item.children.map((dropDownItem) => (
            <li key={dropDownItem.id} className='text-white p-2 hover:bg-sky-400 cursor-pointer'>
              <Link
                href={dropDownItem.path}
                className='w-full block'
              >
                {dropDownItem.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default NavLink;
