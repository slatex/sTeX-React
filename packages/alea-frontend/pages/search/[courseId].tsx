import { NextPage } from 'next';
import { useRouter } from 'next/router';
import SearchCourseNotes from '../../components/SearchCourseNotes';
import MainLayout from '../../layouts/MainLayout';

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { query, courseId } = router.query as { query?: string; courseId?: string };
  return (
    <MainLayout title="Search">
      <SearchCourseNotes courseId={courseId || ''} query={query} />
    </MainLayout>
  );
};

export default SearchPage;
