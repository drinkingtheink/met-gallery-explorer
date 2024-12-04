import React, { useState, useEffect } from 'react';

const MetMuseumExplorer = () => {
  const [artworks, setArtworks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allObjectIds, setAllObjectIds] = useState([]);

  const ARTWORKS_PER_PAGE = 12;

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

  // Fetch artworks when department is selected or page changes
  const fetchArtworks = async (department, currentPage) => {
    setIsLoading(true);
    try {
      // First, search for all object IDs in the department
      if (!allObjectIds.length) {
        const searchResponse = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(department)}&hasImages=true`
        );
        
        if (!searchResponse.ok) {
          throw new Error('Failed to fetch artwork IDs');
        }
        
        const searchData = await searchResponse.json();
        setAllObjectIds(searchData.objectIDs || []);
        setTotalPages(Math.ceil((searchData.objectIDs || []).length / ARTWORKS_PER_PAGE));
      }

      // Calculate the slice of object IDs for current page
      const startIndex = (currentPage - 1) * ARTWORKS_PER_PAGE;
      const endIndex = startIndex + ARTWORKS_PER_PAGE;
      const pageObjectIds = allObjectIds.slice(startIndex, endIndex);

      // Fetch details for each artwork on current page
      const artworkDetails = await Promise.all(
        pageObjectIds.map(async (id) => {
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
    setPage(1);
    setAllObjectIds([]); // Reset object IDs
    fetchArtworks(department, 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArtworks(selectedDepartment, nextPage);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchArtworks(selectedDepartment, prevPage);
    }
  };

  if (error) {
    return <div style={{color: 'red'}}>Error: {error}</div>;
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#F5F5F5',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#E0E0E0',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#333',
          fontSize: '2.5rem'
        }}>
          Met Museum Artwork Gallery
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
              width: '300px',
              borderRadius: '5px',
              border: '1px solid #ccc'
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

        {/* Pagination Controls */}
        {selectedDepartment && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '15px'
          }}>
            <button 
              onClick={handlePrevPage}
              disabled={page === 1}
              style={{
                padding: '10px 20px',
                backgroundColor: page === 1 ? '#cccccc' : '#4A4A4A',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <span style={{color: '#333'}}>Page {page} of {totalPages}</span>
            
            <button 
              onClick={handleNextPage}
              disabled={page === totalPages}
              style={{
                padding: '10px 20px',
                backgroundColor: page === totalPages ? '#cccccc' : '#4A4A4A',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}

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

        {/* Artwork Gallery Wall */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '40px',
          padding: '40px',
          backgroundColor: '#D3D3D3',
          borderRadius: '15px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
        }}>
          {artworks.map((artwork, index) => (
            <div 
              key={artwork.objectID + index}
              style={{
                backgroundColor: '#F0F0F0',
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                borderRadius: '10px',
                overflow: 'hidden',
                transform: `rotate(${(index % 2 ? 1 : -1) * (Math.random() * 3)}deg)`,
                transition: 'transform 0.3s ease',
                perspective: '1000px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) rotate(0deg)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = `rotate(${(index % 2 ? 1 : -1) * (Math.random() * 3)}deg)`;
                e.currentTarget.style.zIndex = 'auto';
              }}
            >
              {/* Frame */}
              <div style={{
                border: '15px solid #8B4513', // Dark wood frame color
                borderImage: 'linear-gradient(to right, #8B4513, #D2691E)',
                borderImageSlice: 1,
                padding: '10px',
                backgroundColor: '#F0F0F0',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  border: '2px solid #000',
                  padding: '5px'
                }}>
                  <img
                    src={artwork.primaryImage || '/api/placeholder/300/400'}
                    alt={artwork.title}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              </div>
              
              {/* Artwork Details */}
              <div style={{
                padding: '15px',
                backgroundColor: '#F0F0F0',
                textAlign: 'center'
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
    </div>
  );
};

export default MetMuseumExplorer;