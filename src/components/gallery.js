import React, { useState, useEffect } from 'react';

const ChicagoArtGallery = () => {
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setIsLoading(true);
        // Calculate offset based on page number
        const limit = 12;
        const offset = (page - 1) * limit;

        // Art Institute of Chicago's public API endpoint with pagination
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?limit=${limit}&page=${page}&fields=id,title,artist_title,image_id,date_display`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        
        const data = await response.json();
        
        // Transform the data to include image URLs
        const artworksWithImages = data.data.map(artwork => ({
          ...artwork,
          imageUrl: artwork.image_id 
            ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
            : '/api/placeholder/300/400'
        }));
        
        setArtworks(artworksWithImages);
        
        // Calculate total pages (assuming the API provides pagination info)
        setTotalPages(Math.ceil(data.pagination.total / limit));
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchArtworks();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prevPage => prevPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh'
      }}>
        <p>Loading artworks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        color: 'red'
      }}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '24px',
        marginBottom: '20px'
      }}>
        Art Institute of Chicago Gallery
      </h1>
      
      {/* Pagination Controls */}
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

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {artworks.map((artwork) => (
          <div 
            key={artwork.id} 
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'}
          >
            <img
              src={artwork.imageUrl}
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
                fontSize: '18px',
                marginBottom: '5px'
              }}>
                {artwork.title}
              </h3>
              <p style={{
                color: '#666',
                marginBottom: '5px'
              }}>
                {artwork.artist_title || 'Artist Unknown'}
              </p>
              <p style={{
                color: '#999',
                fontSize: '14px'
              }}>
                {artwork.date_display || 'Date Unknown'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChicagoArtGallery;