import PropTypes from 'prop-types';

export interface GraphFilterProps {
  onFilterChange: PropTypes.func;
  onError: PropTypes.func;
}

export interface GraphFilterState {
  graphDuration: string;
  graphLayout: any;
  graphNamespace: string;
  availableNamespaces: { name: string }[];
}
