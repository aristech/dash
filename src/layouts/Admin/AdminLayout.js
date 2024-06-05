
'use client'
import React, { useState  } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { toggleSidebar } from '@/features/userSlice';
import { Button } from 'primereact/button';
import ProfileButton from '@/components/NavProfileButton';
import { Sidebar } from 'primereact/sidebar';
import NewSidebar from './NewSidebar';
import BreadCrumbs from './BreadCrumbs';


// EXPORT ADMIN LAYOUT:
const AdminLayout = ({ children }) => {
	const { isSidebarOpen } = useSelector((store) => store.user)
	const dispatch = useDispatch()
	const handleToggleSidebar = () => {
		dispatch(toggleSidebar())
	}
	
	return (
		<Container>
			
			{isSidebarOpen ? <NewSidebar  /> : null}
			<Content isSidebarOpen={isSidebarOpen} >
				<Navbar  isSidebarOpen={isSidebarOpen}>
					<div className='top'>
					<Button
						icon="pi pi-bars"
						text aria-label="navburger"
						style={{width: '35px', height: '35px', fontSize: '12px',  backgroundColor: 'var(--surface-50)', border:'none', color: 'var(--primary-400)'}}
						onClick={handleToggleSidebar}
				/>
					<div className='navbar-rightdiv'>
						<FullScreen>
							{children}
						</FullScreen>
						<ProfileButton />
					</div>
					</div>
					<div className='bottom'>
					<BreadCrumbs />
					</div>
					
				</Navbar>
				<MainContent>
					{children}
				</MainContent>
			</Content>
		</Container>
	);

}



function FullScreen({ children }) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="card flex justify-content-center" >
			<Sidebar visible={visible} onHide={() => setVisible(false)} fullScreen >
				{children}
			</Sidebar>
			<Button
				style={{width: '35px', height: '35px', fontSize: '12px',  backgroundColor: 'var(--primary-400)', border:'none'}}
				icon="pi pi-window-maximize"
				aria-label="Maximize"
				onClick={() => setVisible(true)}
				/>
		</div>
	)
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  transition: width 0.3s ease-in-out;
  width: 100%;
`;




const Content = styled.div`
	flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.palette.background};
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  right: 0;
  background-color: #fff;
  z-index: 10;
  width: ${({ isSidebarOpen }) => isSidebarOpen ? 'calc(100% - 240px)' : '100%'};
  .navbar-rightdiv {
	display: flex;
	align-items: center;
	div {
		margin-left: 5px;
	}
  }
  .top {
	display: flex;
	align-items: center;
	width: 100%;
	justify-content: space-between;
	border-bottom: 1px solid #ededed;
	padding: 10px;
	height: 70px;
  }

  .bottom {
	height: 45px;
	display: flex;
	align-items: center;
  }
  @media (max-width: 1024px) {
		width: ${({ isSidebarOpen }) => isSidebarOpen ? '0' : '100%'};
   }
`;

const MainContent = styled.div`
  padding: 35px;
  margin-top: 110px;
  background-color: ${({ theme }) => theme.palette.background};
  width: ${({ isSidebarOpen }) => isSidebarOpen ? 'calc(100% - 240px)' : '100%'};
  transition: width 0.3s ease-in-out;
`;





export default AdminLayout