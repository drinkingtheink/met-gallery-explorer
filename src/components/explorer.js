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
              backgroundColor: page === 1 ? '#cccccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span>Page {page} of {totalPages}</span>
          
          <button 
            onClick={handleNextPage}
            disabled={page === totalPages}
            style={{
              padding: '10px 20px',
              backgroundColor: page === totalPages ? '#cccccc' : '#007bff',
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