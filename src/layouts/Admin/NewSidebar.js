import React, { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'
import { toggleSidebar } from '@/features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import styles from './styles.module.css'

const navConfig = [
    {
        title: 'Πίνακας Ελέγχου',
        href: '/dashboard',
    }
    ,
    {
        title: 'Προϊόντα',
        href: '#',
        children: [
            {
                title: 'Λίστα Προϊόντων',
                href: '/dashboard/product',
            },
            {
                title: 'Κατηγοριοποίηση',
                href: '#',
                children: [
                    {
                        title: 'Εμπορικές Κατηγορίες',
                        href: '/dashboard/product/mtrcategories',
                    },
                    {
                        title: 'Ομάδες',
                        href: '/dashboard/product/mtrgroup',
                    },
                    {
                        title: 'Υποομάδες',
                        href: '/dashboard/product/mtrsubgroup',
                    }
                ]
            },
            {
                title: 'Μάρκες',
                href: '/dashboard/product/brands',
            },
            {
                title: 'Κατασκευαστές',
                href: '/dashboard/product/manufacturers',
            },
            {
                title: 'Απενεργοποίηση Προϊόντων ',
                href: '/dashboard/product/deactivate-products',
            }
           
        ]
    }
    ,
    {
        title: 'Πελάτες',
        href: '#',
        children: [
            {
                title: 'Λίστα Πελατών',
                href: '/dashboard/clients',
            },
            {
                title: 'Προσφορές',
                href: '/dashboard/offer',
            },
            {
                title: 'Προσφορές Πολλαπλών Επιλογών',
                href: '/dashboard/multi-offer',
            }
        ]
    }   
    ,
    {
        title: 'Προμηθευτές',
        href: '#',
        children: [
            {
                title: 'Λίστα Προμηθευτών',
                href: '/dashboard/suppliers',
            },
            {
                title: 'Picking',
                href: '/dashboard/suppliers/picking',
            },
            {
                title: 'Λίστα Παραγγελίες (Χωρίς Όριο)',
                href: '/dashboard/suppliers/small-orders',
            }
        ]
    }
    ,
    {
        title: 'IMPA',
        href: '/dashboard/info/impas',
    },
    {
        title: 'Χρήστες',
        href: '/dashboard/users',
    }
    ,
   
]

const NewSidebar = () => {
    const dispatch = useDispatch()
    const [expandedItems, setExpandedItems] = useState({});
    const toggleItem = (itemKey) => {
        setExpandedItems((prevState) => ({
            ...prevState,
            [itemKey]: !prevState[itemKey],
        }));
    };


    const handleToggleSidebar = () => {
        dispatch(toggleSidebar())
    }
    const renderMenuItems = (items, parentKey = '', level = 0) => {
        return (
            <ul>
                {items.map((item, index) => {
                    // Generate a unique key for each menu item based on its level and index
                    const itemKey = `${parentKey}-${index}`;
                    const isExpanded = expandedItems[itemKey];

                    return (
                        <React.Fragment key={itemKey}>
                            <li 
                                className={` ${styles.menuItem} ${styles[`menuItem${level}`]} `}
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleItem(itemKey);
                                }}
                                >
                                <Link href={item.href} >
                                    {item.title}
                                </Link>
                                {item.children ? (<i className={` pi ${!isExpanded? 'pi-angle-down' : 'pi-angle-up'}`} style={{ fontSize: '1rem' }}></i>) : null}
                        </li>
                         {isExpanded && item.children && renderMenuItems(item.children, itemKey, level + 1)}
                        </React.Fragment>
                    );
                })}
            </ul>
        );
    };

    return (    
        <aside className={styles.container}>
            <div className={styles.top}>
                <Image src="/uploads/logoPlain.png" width={150} height={35} alt="dgsoft-logo" priority />
                <i onClick={() => handleToggleSidebar()} className={`${styles.burgerClose} pi pi-angle-left`} style={{ fontSize: '1.5rem', color: 'black' }}></i>

            </div>
            <div className={styles.main}>
                {/* <SidebarList /> */}
                {renderMenuItems(navConfig)}

            </div>
            <div className='bottom'></div>
        </aside>
    )
}












export default NewSidebar;