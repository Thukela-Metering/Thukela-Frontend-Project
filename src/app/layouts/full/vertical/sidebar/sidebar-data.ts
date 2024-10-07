// sidebar-data.ts

import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'User Management',
    iconName: 'user-plus',
    route: '/apps/employee', // Updated to absolute path
    children: [
      {
        displayName: 'Manage users',
        iconName: 'point',
        route: '/apps/employee', // Ensure this matches AppsRoutes
      },
    ],
  },
  {
    navCap: 'Buildings',
  },
  {
    displayName: 'Building Management',
    iconName: 'apps',
    route: '/apps/building', // Updated to absolute path
    children: [
      {
        displayName: 'Buildings',
        iconName: 'point',
        route: '/apps/building',     
      },
      {
        displayName: 'Building Accounts',
        iconName: 'point',
        route: '/apps/building/buildingAccount',     
      },
      {
        displayName: 'Representative Link',
        iconName: 'point',
        route: '/apps/building/buildingRepresentative',     
      },
      {
        displayName: 'PropertyGroup Link',
        iconName: 'point',
        route: '/apps/building/buildingPropertyGroup',     
      },
      {
        displayName: 'Building Owner',
        iconName: 'point',
        route: '/apps/building/buildingOwner',     
      },
      {
        displayName: 'Building Portfolio',
        iconName: 'point',
        route: '/apps/building/Portfolio',     
      },
    ],
  },
  {
    navCap: 'Accounts',
  },
  {
    displayName: 'Invoicing',
    iconName: 'file-invoice',
    route: '/apps/invoice', // Updated to absolute path
    children: [
      {
        displayName: 'Quotes',
        iconName: 'point',
        route: '/apps/Quotes',     
      },
      {
        displayName: 'Invoice List',
        iconName: 'point',
        route: '/apps/invoice',     
      },
      { 
        displayName: 'Credit Note',
        iconName: 'point',
        route: '/apps/creditNote',   
      },
      { 
        displayName: 'Recurring Invoices',
        iconName: 'point',
        route: '/apps/recurring',   
      },
    ],
  },
  {
    displayName: 'Payments',
    iconName: 'file-invoice',
    route: '/apps/payment', // Updated to absolute path
    children: [
      {
        displayName: 'Load Payment',
        iconName: 'point',
        route: '/apps/statementSearch',              
      },
      {
        displayName: 'Payment List',
        iconName: 'point',
        route: '/apps/payment',              
      },
    ],
  },
  {
    displayName: 'Ledger',
    iconName: 'file-invoice',
    route: '/apps/badDept', // Updated to absolute path
    children: [
      { 
        displayName: 'Bad Dept',
        iconName: 'point',
        route: '/apps/badDept',   
      },
      {
        displayName: 'Statement Screen',
        iconName: 'point',
        route: '/apps/statement',     
      },
    ],
  },
  {
    navCap: 'Job Cards',
  },
  {
    displayName: 'Job Cards',
    iconName: 'file-invoice',
    route: '/apps/Job-Cards', // Updated to absolute path
    children: [
      {
        displayName: 'Job Cards',
        iconName: 'point',
        route: '/apps/Job-Cards',     
      },
    ],
  },
  {
    navCap: 'Reporting',
  },
  {
    displayName: 'Reports',
    iconName: 'file-invoice',
    route: '/apps/debitorsReport', // Updated to absolute path
    children: [
      {
        displayName: 'Debitors Report',
        iconName: 'point',
        route: '/apps/debitorsReport',     
      },
    ],
  },
  {
    navCap: 'Products',
  },
  {
    displayName: 'Product-management',
    iconName: 'file-invoice',
    route: '/apps/product-management', // Updated to absolute path
    children: [
      {
        displayName: 'Product Management',
        iconName: 'point',
        route: '/apps/product-management',     
      },
    ],
  },
  {
    navCap: 'Tools',
  },
  {
    displayName: 'Tools',
    iconName: 'file-invoice',
    route: '/apps/hangfire', // Updated to absolute path
    children: [
      {
        displayName: 'Hangfire Dashboard',
        iconName: 'point',
        route: '/apps/hangfire',     
      },
      {
        displayName: 'Importing',
        iconName: 'point',
        route: '/apps/Import',     
      },
    ],
  },
];
