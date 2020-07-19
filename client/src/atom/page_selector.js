import React from "react";

const style = {
  arrow: {
    minWidth: '30px',
  },
  index: {
    ':nthChild(even)': { backgroundColor: 'grey' },
  },
};

export default (props) => {
  let { page, perPage=20, total } = props;

  if (!total) {
    return null;
  }

  [page, setPage] = React.useState(page);

  let pageEnd = page + 4;
  let pageMax = Math.floor(total / perPage);
  let pageStart = page - 4;

  if (pageStart < 0) {
    if (pageEnd - pageStart <= pageMax) {
      pageEnd -= pageStart;
    }

    pageStart = 0;
  }

  if (pageEnd > pageMax) {
    if (pageStart - (pageEnd - pageMax) >= 0) {
      pageStart -= (pageEnd - pageMax);
    }

    pageEnd = pageMax;
  }

  const tabs = [];

  for (;pageStart <= pageEnd; pageStart += 1) {
    tabs.push(<a className='link default' style={ style.index }>{ pageStart }</a>);
  }

  return <div className='c20'>
    <a className='link default' style={ style.arrow }>&lt;&lt;</a>
    { tabs }
    <a className='link default' style={ style.arrow }>&gt;&gt;</a>
  </div>;
};
