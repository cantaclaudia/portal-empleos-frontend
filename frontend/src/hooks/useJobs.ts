export const useJobs = (searchFilters, selectedFilters) => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getAvailableJobs({ searchFilters, selectedFilters })
      .then(setJobs);
  }, [searchFilters, selectedFilters]);

  return { jobs };
};