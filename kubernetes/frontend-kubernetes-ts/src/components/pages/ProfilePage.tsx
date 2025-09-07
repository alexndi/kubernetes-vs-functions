// Profile Page Component
import React, { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useUserProfile } from '../../hooks/useUserProfile';

function ProfilePage() {
  const { keycloak } = useKeycloak();
  const { userProfile, fetchUserProfile, loading, error } = useUserProfile();

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">
          <h3>Unable to load profile</h3>
          <p>{error}</p>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={fetchUserProfile}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => keycloak.login()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Re-login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <div className="loading">Profile not found</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <h3>{userProfile.user.preferred_username || userProfile.user.name || 'User'}</h3>
          {userProfile.user.email && <p className="profile-email">{userProfile.user.email}</p>}
        </div>

        <div className="profile-details">
          <h4>Account Information</h4>
          <p>
            <strong>User ID:</strong> {userProfile.user.sub}
          </p>
          {userProfile.user.given_name && (
            <p>
              <strong>First Name:</strong> {userProfile.user.given_name}
            </p>
          )}
          {userProfile.user.family_name && (
            <p>
              <strong>Last Name:</strong> {userProfile.user.family_name}
            </p>
          )}

          <h4>Roles and Permissions</h4>
          {userProfile.user.realm_access && userProfile.user.realm_access.roles ? (
            <ul className="role-list">
              {userProfile.user.realm_access.roles.map((role) => (
                <li key={role} className="role-item">
                  {role}
                </li>
              ))}
            </ul>
          ) : (
            <p>No specific roles assigned</p>
          )}

          <div className="profile-message">
            <p>{userProfile.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
