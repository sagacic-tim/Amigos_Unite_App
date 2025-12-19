// Source - https://stackoverflow.com/a
// Posted by Bash
// Retrieved 2025-11-15, License - CC BY-SA 4.0

export const navItems = [
  {
    id: 1,
    title: 'MIR',
    path: '/mir',
    cName: 'nav-item'
  },
  {
    id: 2,
    title: 'QA',
    path: '/qa',
    cName: 'nav-item',
    children: [
      {
        id: 1,
        title: 'QA Job Selector',
        path: '/qaindex',
        cName: 'submenu-item'
      },
      {
        id: 2,
        title: 'View QA Results',
        path: '/finished_qa_jobs',
        cName: 'submenu-item'
      },
    ]
  },
  {
    id: 3,
    title: 'Users',
    path: '/users',
    cName: 'nav-item',
    children: [
      {
        id: 1,
        title: 'QA Job Selector',
        path: '/qaindex',
        cName: 'submenu-item'
      },
      {
        id: 2,
        title: 'View QA Results',
        path: '/finished_qa_jobs',
        cName: 'submenu-item'
      },
    ]
  },
  {
    id: 4,
    title: 'Stats',
    path: '/stats',
    cName: 'nav-item',
    children: [
      {
        id: 1,
        title: 'QA Job Selector',
        path: '/qaindex',
        cName: 'submenu-item'
      },
      {
        id: 2,
        title: 'View QA Results',
        path: '/finished_qa_jobs',
        cName: 'submenu-item'
      },
    ]
  },
  {
    id: 5,
    title: 'Tools',
    path: '/tools',
    cName: 'nav-item'
  },
  {
    id: 6,
    title: 'Sheets',
    path: '/sheets',
    cName: 'nav-item'
  },
  {
    id: 7,
    title: 'My Account',
    path: '/personal',
    cName: 'nav-item'
  },
];

