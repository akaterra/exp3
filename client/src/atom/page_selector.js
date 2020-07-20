import React from "react";

const style = {
  container: {
    '>*:nthChild(even)': { backgroundColor: 'grey' },
  },
  index: {
    fontFamily: 'monospace',
    minWidth: '4rem',
  },
  nav: {
    fontFamily: 'monospace',
    minWidth: '4rem',
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
        className={ start === currentIndex ? 'link primary text-shadow center' : 'link default center' }
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
    <button className='button button-inline primary center' style={ style.nav }>1</button>
    <button className='button button-inline default center' style={ style.nav } onClick={ _ => {
      if (props.onSelect && currentIndex - 10 >= 0) {
        props.onSelect(currentIndex - 10, (currentIndex - 10) * perPage);
      }
    } }>-10</button>
    <button className='button button-inline default center' style={ style.nav } onClick={ _ => {
      if (props.onSelect && currentIndex - 1 >= 0) {
        props.onSelect(currentIndex - 1, (currentIndex - 1) * perPage);
      }
    } }>-1</button>
      { tabs }
    <button className='button button-inline default center' style={ style.nav } onClick={ _ => {
      if (props.onSelect && currentIndex + 1 <= max) {
        props.onSelect(currentIndex + 1, (currentIndex + 1) * perPage);
      }
    } }>+1</button>
    <button className='button button-inline default center' style={ style.nav } onClick={ _ => {
      if (props.onSelect && currentIndex + 10 <= max) {
        props.onSelect(currentIndex + 10, (currentIndex + 10) * perPage);
      }
    } }>+10</button>
    <button className='button button-inline primary center' style={ style.nav }>{ max + 1 }</button>
  </div>;
};
