import React, { useState, useEffect } from 'react';

const MetMuseumExplorer = () => {
  const [artworks, setArtworks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments on initial load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Public list of Met Museum departments
        const departmentList = [
          'American Wing',
          'Ancient Near Eastern Art',
          'Arms and Armor',
          'Arts of Africa, Oceania, and the Americas',
          'Asian Art',
          'Costume Institute',
          'Egyptian Art',
          'European Paintings',
          'European Sculpture and Decorative Arts',
          'Greek and Roman Art',
          'Islamic Art',
          'Modern and Contemporary Art',
          'Musical Instruments'
        ];
        setDepartments(departmentList);
      } catch (err) {
        setError('Failed to load departments');
      }
    };

    fetchDepartments();
  }, []);

  // Fetch artworks when department is selected
  const fetchArtworks = async (department) => {
    setIsLoading(true);
    try {
      // Note: This is a simulated fetch as the Met Museum API doesn't directly support department filtering
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(department)}&hasImages=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch artworks');
      }
      
      const data = await response.json();
      
      // Limit to first 12 artworks
      const artworkDetails = await Promise.all(
        data.objectIDs.slice(0, 12).map(async (id) => {
          const artworkResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
          return artworkResponse.json();
        })
      );
      
      setArtworks(artworkDetails);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    fetchArtworks(department);
  };

  if (error) {
    return <div style={{color: 'red'}}>Error: {error}</div>;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Met Museum Artwork Explorer
      </h1>

      {/* Department Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <select 
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '300px'
          }}
        >
          <option value="">Select a Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          Loading artworks...
        </div>
      )}

      {/* Artwork Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {artworks.map((artwork) => (
          <div 
            key={artwork.objectID}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img
              src={artwork.primaryImage || '/api/placeholder/300/400'}
              alt={artwork.title}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover'
              }}
            />
            <div style={{
              padding: '15px'
            }}>
              <h3 style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '5px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {artwork.title}
              </h3>
              <p style={{
                color: '#666',
                fontSize: '14px',
                marginBottom: '5px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {artwork.artistDisplayName || 'Artist Unknown'}
              </p>
              <p style={{
                color: '#999',
                fontSize: '12px'
              }}>
                {artwork.objectDate || 'Date Unknown'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetMuseumExplorer;