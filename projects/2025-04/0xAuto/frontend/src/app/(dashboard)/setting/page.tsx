"use client"; // Required for useState, useEffect, and DOM manipulation

import React, { useState, useEffect, useRef, ChangeEvent } from 'react'; // Added useRef, ChangeEvent
import { PencilSquareIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'; // Import icons

const SettingPage = () => {
  // Mock data - replace later
  const username = 'MockUser';
  const currentPoints = 1234;

  const [theme, setTheme] = useState('light'); // Default theme

  // State for Profile Edit Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileIconPreviewUrl, setProfileIconPreviewUrl] = useState<string | null>('/logo.png'); // Default/mock icon
  const profileModalRef = useRef<HTMLDialogElement>(null);

  // State for Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  // Profile Modal Handlers
  const handleOpenProfileModal = () => {
    // Reset preview if needed, e.g., load current user icon
    setProfileIconPreviewUrl('/logo.png'); // Reset to default/mock
    profileModalRef.current?.showModal();
  };

  const handleCloseProfileModal = () => {
    profileModalRef.current?.close();
  };

  const handleProfileIconChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileIconPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileIconPreviewUrl('/logo.png'); // Revert if no file selected
    }
  };

  const handleSaveProfileChanges = () => {
    console.log("Mock Save Profile: User details would be saved here.");
    // Collect form data and send to backend
    handleCloseProfileModal();
  };

  // Delete Modal Handlers
  const handleOpenDeleteModal = () => {
    deleteModalRef.current?.showModal();
  };
  const handleCloseDeleteModal = () => {
    deleteModalRef.current?.close();
  };
  const handleConfirmDelete = () => {
    console.log("Mock Delete Account: Account deletion initiated.");
    // Add actual deletion logic here
    handleCloseDeleteModal();
  };

  // Effect to load theme from local storage and apply it
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light'; // Default to light if nothing stored
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  // Function to handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Account Section */}
      <section className="mb-8 p-6 card bg-base-100 shadow-xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Account</h2>
            <button className="btn btn-outline btn-sm" onClick={handleOpenProfileModal}>
                <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit Profile
            </button>
        </div>
        <div className="form-control mb-4">
          <label className="label">
            <span id="username-label" className="label-text">Username</span>
          </label>
          <input id="username-input" type="text" value={username} readOnly className="input input-bordered w-full max-w-md" aria-labelledby="username-label" /> {/* Changed max-w-xs to max-w-md */}
        </div>
        {/* System Prompt */}
        <div className="form-control mb-4">
          <label className="label">
            <span id="system-prompt-label" className="label-text">System Prompt</span>
          </label>
          <textarea
            id="system-prompt-input"
            className="textarea textarea-bordered h-24 w-full max-w-md" // Changed max-w-xs to max-w-md
            placeholder="Enter system prompt..."
            aria-labelledby="system-prompt-label"
          ></textarea>
           {/* TODO: Implement saving */}
        </div>
        {/* Upload Icon */}
        <div className="form-control mb-4">
           <label className="label">
             <span id="icon-upload-label" className="label-text">Upload Icon</span>
           </label>
           <input
             id="icon-upload-input"
             type="file"
             className="file-input file-input-bordered w-full max-w-md" // Changed max-w-xs to max-w-md
             aria-labelledby="icon-upload-label"
             accept="image/*" // Accept only image files
           />
           {/* TODO: Implement upload logic */}
        </div>
        {/* Removed redundant Save button as modal handles saving */}
      </section>

      {/* Billing Section */}
      <section className="mb-8 p-6 card bg-base-100 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Billing</h2>
        <div className="flex items-center mb-4 gap-4 flex-wrap"> {/* Added flex-wrap */}
           <p>Current Points: <span className="font-bold">{currentPoints}</span></p>
           <button className="btn btn-primary btn-sm" onClick={() => console.log('Mock Recharge Clicked')}>Recharge</button> {/* Added mock onClick */}
           {/* TODO: Implement recharge flow */}
        </div>
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <span className="label-text">Enable Auto-Recharge</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              onChange={(e) => console.log(`Mock Auto-Recharge Toggled: ${e.target.checked}`)} // Added mock onChange
            />
             {/* TODO: Add auto-recharge settings */}
          </label>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="mb-8 p-6 card bg-base-100 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Appearance</h2>
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <span className="label-text">Dark Mode</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={theme === 'dark'}
              onChange={handleThemeChange}
            />
          </label>
        </div>
      </section>

      {/* Session Section */}
      <section className="p-6 card bg-base-100 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Account Management</h2> {/* Changed section title */}
        {/* Updated Delete button to open modal */}
        <button className="btn btn-error w-full max-w-md" onClick={handleOpenDeleteModal}>Delete Account</button>
         {/* TODO: Implement account deletion functionality */}
      </section>

     {/* Profile Edit Modal */}
     <dialog id="profile_edit_modal" className="modal" ref={profileModalRef}>
       <div className="modal-box w-11/12 max-w-lg">
         <h3 className="font-bold text-lg mb-4">Edit Profile</h3>

         {/* Form Fields */}
         <div className="form-control mb-4">
           <label className="label"><span className="label-text">Username</span></label>
           <input type="text" defaultValue={username} className="input input-bordered w-full" />
         </div>

         {/* Icon Upload */}
         <div className="form-control mb-4">
           <label className="label"><span className="label-text">Profile Icon</span></label>
           <div className="flex items-center gap-4">
             <div className="avatar">
               <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                 <img src={profileIconPreviewUrl || '/logo.png'} alt="Profile Icon Preview" />
               </div>
             </div>
             <label htmlFor="profile-icon-upload-modal" className="btn btn-outline btn-sm">
               <ArrowUpTrayIcon className="h-4 w-4 mr-1" /> Upload Icon
             </label>
             <input
               id="profile-icon-upload-modal"
               type="file"
               className="hidden"
               accept="image/*"
               onChange={handleProfileIconChange}
             />
           </div>
         </div>

         <div className="form-control mb-4">
           <label className="label"><span className="label-text">System Prompt</span></label>
           <textarea
             className="textarea textarea-bordered h-24 w-full"
             placeholder="Enter default system prompt..."
             // defaultValue={/* Load actual user prompt here */}
           ></textarea>
         </div>

         {/* Modal Actions */}
         <div className="modal-action mt-6">
           <button className="btn btn-ghost" onClick={handleCloseProfileModal}>Cancel</button>
           <button className="btn btn-primary" onClick={handleSaveProfileChanges}>Save Profile</button>
         </div>

         <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleCloseProfileModal} aria-label="Close">
           <XMarkIcon className="h-5 w-5"/>
         </button>
       </div>
       <form method="dialog" className="modal-backdrop"><button>close</button></form>
     </dialog>

     {/* Delete Account Confirmation Modal */}
     <dialog id="delete_account_modal" className="modal" ref={deleteModalRef}>
       <div className="modal-box">
         <h3 className="font-bold text-lg text-error">Confirm Account Deletion</h3>
         <p className="py-4">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
         <div className="modal-action">
           <button className="btn btn-ghost" onClick={handleCloseDeleteModal}>Cancel</button>
           <button className="btn btn-error" onClick={handleConfirmDelete}>Delete Account</button>
         </div>
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleCloseDeleteModal} aria-label="Close">
           <XMarkIcon className="h-5 w-5"/>
         </button>
       </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
     </dialog>

     {/* Delete Account Confirmation Modal - Moved inside main div */}
      {/* Misplaced modal block removed */}

   </div>

  );
};

export default SettingPage;