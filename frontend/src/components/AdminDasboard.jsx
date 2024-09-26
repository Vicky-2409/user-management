import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultProfileImage = "https://static.vecteezy.com/system/resources/previews/020/765/399/non_2x/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '', profileImage: '' });
  const [showModal, setShowModal] = useState(false);

  // Check if admin token exists
  useEffect(() => {
    const token = localStorage.getItem('adminApp_token');
    if (!token) {
      window.location.href = '/admin'; // Redirect to the login page if token is not present
    }
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminApp_token');
    try {
      const response = await axios.get('http://localhost:3000/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const validateFields = () => {
    const { name, email, mobile, password, confirmPassword } = currentUser;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMobile = String(mobile).trim();

    if (trimmedName.length < 4) return "Please enter a valid name (at least 4 characters).";
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) return "Please enter a valid email address.";
    if (!/^[0-9]{10}$/.test(trimmedMobile)) return "Mobile number must be 10 digits.";
    
    if (!isEditing) {
      const trimmedPassword = password.trim();
      const trimmedConfirmPassword = confirmPassword.trim();
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(trimmedPassword)) {
        return "Password must be at least 8 characters long, include uppercase, lowercase, digit, and special character.";
      }
      if (trimmedPassword !== trimmedConfirmPassword) return "Passwords do not match.";
    }
    return null;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const validationError = validateFields();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const token = localStorage.getItem('adminApp_token');
    const formData = new FormData();
    formData.append('name', currentUser.name);
    formData.append('email', currentUser.email);
    formData.append('mobile', currentUser.mobile);
    formData.append('password', currentUser.password);
    if (currentUser.profileImage) {
      formData.append('profileImage', currentUser.profileImage);
    }

    try {
      const response = await axios.post('http://localhost:3000/admin/users', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'ok') {
        toast.success('User created successfully.');
        setShowModal(false);
        setCurrentUser({ name: '', email: '', mobile: '', password: '', confirmPassword: '', profileImage: null });
        fetchUsers();
      } else {
        toast.error('Failed to create user.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error creating user:', error);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const validationError = validateFields();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const token = localStorage.getItem('adminApp_token');
    const formData = new FormData();
    formData.append('name', currentUser.name);
    formData.append('email', currentUser.email);
    formData.append('mobile', currentUser.mobile);
    if (currentUser.profileImage && typeof currentUser.profileImage !== 'string') {
      formData.append('profileImage', currentUser.profileImage);
    }

    try {
      const response = await axios.put(`http://localhost:3000/admin/users/${currentUser._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'ok') {
        toast.success('User updated successfully.');
        setShowModal(false);
        setCurrentUser({ name: '', email: '', mobile: '', password: '', confirmPassword: '', profileImage: '' });
        fetchUsers();
      } else {
        toast.error('Failed to update user.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error updating user:', error);
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    const token = localStorage.getItem('adminApp_token');
    try {
      await axios.delete(`http://localhost:3000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully.');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.');
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsEditing(true);
    setShowModal(true);
  };

  const toggleModal = () => {
    setIsEditing(false);
    setCurrentUser({ name: '', email: '', mobile: '', password: '', confirmPassword: '', profileImage: '' });
    setShowModal(!showModal);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminApp_token');
    window.location.href = '/admin'; // Redirect to the login page
  };

  return (
    <div className="relative flex justify-center items-center w-full h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {/* Sticky Header for Admin Dashboard */}
        <div className="sticky top-0 z-10 bg-white py-4 border-b border-gray-200">
          <h1 className="mb-6 text-center text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 p-2 rounded-md flex-grow mr-4 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
{/* Add User Button */}
<button
  onClick={toggleModal}
  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300 shadow-md focus:outline-none focus:ring focus:ring-green-300 mr-4"
>
  Create User
</button>

{/* Logout Button */}
<button
  onClick={handleLogout}
  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 shadow-md focus:outline-none focus:ring focus:ring-red-300"
>
  Logout
</button>

          </div>
        </div>

        {/* Scrollable user list */}
        <div className="flex flex-col space-y-6 max-h-96 overflow-y-auto p-2">
          {filteredUsers.length > 0 ? filteredUsers.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 border rounded-md shadow-sm">
              <div className="flex items-center">
                <img
                  src={`http://localhost:3000/uploads/${user.profileImage }`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-gray-300 shadow-sm mr-4"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-gray-500">{user.email}</span>
                  <span className="text-gray-500">{user.mobile}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 shadow-md focus:outline-none focus:ring focus:ring-blue-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 shadow-md focus:outline-none focus:ring focus:ring-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500">No users found.</div>
          )}
        </div>

        {/* Modal for creating/updating user */}
        {showModal && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit User' : 'Create User'}</h2>
              <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    className="border border-gray-300 p-2 rounded-md w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    className="border border-gray-300 p-2 rounded-md w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={currentUser.mobile}
                    onChange={(e) => setCurrentUser({ ...currentUser, mobile: e.target.value })}
                    className="border border-gray-300 p-2 rounded-md w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    required
                  />
                </div>
                {!isEditing && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={currentUser.password}
                        onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={currentUser.confirmPassword}
                        onChange={(e) => setCurrentUser({ ...currentUser, confirmPassword: e.target.value })}
                        className="border border-gray-300 p-2 rounded-md w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCurrentUser({ ...currentUser, profileImage: e.target.files[0] })}
                    className="border border-gray-300 p-2 rounded-md w-full shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={toggleModal}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
