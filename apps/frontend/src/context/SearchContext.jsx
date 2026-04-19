import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { api } from '../services/api'

const SearchContext = createContext(null)

const initialState = {
  query:          '',
  results:        [],
  total:          0,
  loading:        false,
  error:          null,
  stats:          null,
  presetQueries:  [],
  alpha:          0.005,
  topK:           20,
  selectedDocId:  null,
  selectedDoc:    null,
  docLoading:     false,
  hasSearched:    false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_QUERY':       return { ...state, query: action.payload }
    case 'SET_ALPHA':       return { ...state, alpha: action.payload }
    case 'SET_TOPK':        return { ...state, topK: action.payload }
    case 'SEARCH_START':    return { ...state, loading: true, error: null, hasSearched: true }
    case 'SEARCH_SUCCESS':  return { ...state, loading: false, results: action.results, total: action.total }
    case 'SEARCH_ERROR':    return { ...state, loading: false, error: action.error, results: [] }
    case 'SET_STATS':       return { ...state, stats: action.payload }
    case 'SET_PRESETS':     return { ...state, presetQueries: action.payload }
    case 'OPEN_DOC':        return { ...state, selectedDocId: action.id, selectedDoc: null, docLoading: true }
    case 'DOC_LOADED':      return { ...state, selectedDoc: action.doc, docLoading: false }
    case 'CLOSE_DOC':       return { ...state, selectedDocId: null, selectedDoc: null, docLoading: false }
    default:                return state
  }
}

export function SearchProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Load stats and preset queries on mount
  useEffect(() => {
    api.stats().then(s => dispatch({ type: 'SET_STATS', payload: s })).catch(() => {})
    api.queries().then(r => dispatch({ type: 'SET_PRESETS', payload: r.queries })).catch(() => {})
  }, [])

  // Open a document
  useEffect(() => {
    if (state.selectedDocId === null) return
    api.document(state.selectedDocId)
      .then(doc => dispatch({ type: 'DOC_LOADED', doc }))
      .catch(err => dispatch({ type: 'CLOSE_DOC' }))
  }, [state.selectedDocId])

  const search = async (queryText = state.query) => {
    const q = queryText.trim()
    if (!q) return
    dispatch({ type: 'SET_QUERY', payload: q })
    dispatch({ type: 'SEARCH_START' })
    try {
      const data = await api.search(q, state.alpha, state.topK)
      dispatch({ type: 'SEARCH_SUCCESS', results: data.results, total: data.total })
    } catch (err) {
      dispatch({ type: 'SEARCH_ERROR', error: err.message })
    }
  }

  const openDoc  = (id) => dispatch({ type: 'OPEN_DOC', id })
  const closeDoc = ()   => dispatch({ type: 'CLOSE_DOC' })

  return (
    <SearchContext.Provider value={{ state, dispatch, search, openDoc, closeDoc }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
