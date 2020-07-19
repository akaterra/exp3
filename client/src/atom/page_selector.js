import React from "react";

const style = {
  container: {
    '>*:nthChild(even)': { backgroundColor: 'grey' },
  },
  arrow: {
    minWidth: '30px',
  },
  index: {
    minWidth: '30px',
  },
};

export default (props) => {
  let { index, perPage=20, total, value } = props;

  if (!total) {
    return null;
  }

  let currentIndex = value !== undefined ? Math.floor(value / perPage) : index;

  let end = currentIndex + 4;
  let max = Math.floor(total / perPage);
  let start = currentIndex - 4;

  if (start < 0) {
    if (end - start <= max) {
      end -= start;
    }

    start = 0;
  }

  if (end > max) {
    if (start - (end - max) >= 0) {
      start -= (end - max);
    }

    end = max;
  }

  const tabs = [];

  for (;start <= end; start += 1) {
    tabs.push(
      <a
        className={ start === currentIndex ? 'bagde link primary text-shadow center' : 'link default center' }
        style={ style.index }
        onClick={ function(start) {
          if (props.onSelect) {
            props.onSelect(start, start * perPage);
          }
        }.bind(null, start) }
      >
        { start + 1 }
      </a>
    );
  }

  return <div className='c20' style={ style.container }>
    <a className='link default center' style={ style.arrow }>&lt;&lt;</a>
    <a className='link default center' style={ style.arrow }>-10</a>
    <a className='link default center' style={ style.arrow }>&lt;</a>
    { tabs }
    <a className='link default center' style={ style.arrow }>&gt;</a>
    <a className='link default center' style={ style.arrow }>+10</a>
    <a className='link default center' style={ style.arrow }>&gt;&gt;</a>
  </div>;
};
