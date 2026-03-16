import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './CustomPagination.css';

/**
 * CustomPagination component
 * @param {object} props
 * @param {number} props.current - Current page (1-indexed)
 * @param {number} props.pageSize - Number of items per page
 * @param {number} props.total - Total number of items
 * @param {function} props.onChange - Callback when page changes: (page) => void
 * @param {function} props.onPageSizeChange - Callback when page size changes: (size) => void
 * @param {string} props.layout - Layout mode: 'full' (left+right), 'right' (only right), 'center' (only center)
 */
const CustomPagination = ({ 
  current, 
  pageSize, 
  total, 
  onChange, 
  onPageSizeChange,
  layout = 'full' 
}) => {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const isFullLayout = layout === 'full';

  // Determine justify-content based on layout mode
  let justifyContent = 'space-between';
  if (layout === 'right') justifyContent = 'flex-end';
  else if (layout === 'center') justifyContent = 'center';

  const renderPages = () => {
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
        // Show first, last, and current +- 1 pages
        if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) {
          pages.push(
            <button 
              key={i}
              className={`page-num ${current === i ? 'active' : ''}`}
              onClick={() => onChange(i)}
            >
              {i}
            </button>
          );
        } else if (Math.abs(i - current) === 2) {
          // If on the edge of the visible pages, show ellipsis
          pages.push(<span key={i} className="pagination-ellipsis">...</span>);
        }
    }
    return pages;
  };

  return (
    <div className="table-footer" style={{ justifyContent }}>
      {isFullLayout && (
        <div className="page-size-selector">
          <span>Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value;
              const newSize = Number(val);
              if (onPageSizeChange) {
                onPageSizeChange(newSize);
              }
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={1000}>Tất cả</option>
          </select>
        </div>
      )}

      <div className="pagination">
        <button 
          className="page-nav" 
          disabled={current === 1}
          onClick={() => onChange(Math.max(1, current - 1))}
        >
          <FaChevronLeft size={12} />
        </button>
        
        {renderPages()}

        <button 
          className="page-nav" 
          disabled={current === totalPages || total === 0}
          onClick={() => onChange(Math.min(totalPages, current + 1))}
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;
