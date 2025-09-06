import React from 'react';
import { LoadingComponent } from '../common/LoadingComponent';
import { UserProfile } from '../../types';

export interface ProfilePageProps {
  user: UserProfile | null;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  if (!user) {
    return <LoadingComponent message="Loading profile..." />;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <h3>{user.name || 'User'}</h3>
          {user.email && <p className="profile-email">{user.email}</p>}
        </div>

        <div className="profile-details">
          <h4>Account Information</h4>
          <p>
            <strong>User ID:</strong> {user.sub}
          </p>
          {user.given_name && (
            <p>
              <strong>First Name:</strong> {user.given_name}
            </p>
          )}
          {user.family_name && (
            <p>
              <strong>Last Name:</strong> {user.family_name}
            </p>
          )}

          <div className="profile-message">
            <p>This is protected data visible only to authenticated users via Microsoft Entra External ID</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
