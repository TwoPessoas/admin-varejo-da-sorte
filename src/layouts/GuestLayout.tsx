import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Outlet />
        </div>
    );
};

export default GuestLayout;