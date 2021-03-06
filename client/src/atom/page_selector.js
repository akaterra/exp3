import React from "react";

const style = {
  container: {
    '>*:nthChild(even)': { backgroundColor: 'grey' },
  },
  index: {
    minWidth: '4rem',
  },
  nav1: {
    minWidth: '4rem',
  },
  nav2: {
    minWidth: '3rem',
  },
};

export default (props) => {
  let { index, perPage=20, total, value } = props;

  if (!total) {
    return null;
  }

  let currentIndex = value !== undefined ? Math.floor(value / perPage) : index;

  let end;
  let max = Math.floor(total / perPage);
  let start = currentIndex - 3;

  if (start < 0) {
    start = 0;
  }

  end = start + 6;

  if (end > max) {
    if (start - (end - max) >= 0) {
      start -= (end - max);
    }

    end = max;
  }

  if (end - start < 6) {
    start = 0;
  }

  const tabs = [];

  for (let i = start; i <= end; i += 1) {
    tabs.push(
      <button
        className={ i === currentIndex ? 'link primary center text-shadow' : 'link default center' }
        style={ style.index }
        onClick={ function(start) {
          if (props.onSelect) {
            props.onSelect(start, start * perPage);
          }
        }.bind(null, i) }
      >
        { i + 1 }
      </button>
    );
  }

  return <div className='c20' style={ style.container }>
    <button className={ `button primary inline center ${currentIndex === 0 ? 'disabled' : ''}` } style={ style.nav1 } onClick={ _ => {
      if (currentIndex > 0) {
        props.onSelect(0, 0);
      }
    } }>1</button>
    <button className={ `link primary center ${currentIndex === 0 ? 'disabled' : ''}` } style={ style.nav2 } onClick={ _ => {
      if (props.onSelect && currentIndex - 10 >= 0) {
        props.onSelect(currentIndex - 10, (currentIndex - 10) * perPage);
      } else if (currentIndex > 0) {
        props.onSelect(0, 0);
      }
    } }>-10</button>
    <button className={ `link primary center ${currentIndex === 0 ? 'disabled' : ''}` } style={ style.nav2 } onClick={ _ => {
      if (props.onSelect && currentIndex - 1 >= 0) {
        props.onSelect(currentIndex - 1, (currentIndex - 1) * perPage);
      }
    } }>-1</button>
      { tabs }
    <button className={ `link primary center ${currentIndex === max ? 'disabled' : ''}` } style={ style.nav2 } onClick={ _ => {
      if (props.onSelect && currentIndex + 1 <= max) {
        props.onSelect(currentIndex + 1, (currentIndex + 1) * perPage);
      }
    } }>+1</button>
    <button className={ `link primary center ${currentIndex === max ? 'disabled' : ''}` } style={ style.nav2 } onClick={ _ => {
      if (props.onSelect && currentIndex + 10 <= max) {
        props.onSelect(currentIndex + 10, (currentIndex + 10) * perPage);
      } else if (currentIndex < max) {
        props.onSelect(max, max * perPage);
      }
    } }>+10</button>
    <button className={ `button primary inline center ${currentIndex === max ? 'disabled' : ''}` } style={ style.nav1 } onClick={ _ => {
      if (currentIndex < max) {
        props.onSelect(max, max * perPage);
      }
    } }>{ max + 1 }</button>
  </div>;
};
