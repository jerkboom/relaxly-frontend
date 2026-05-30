import { FaUniversity } from 'react-icons/fa';

import { University } from '../../types';

interface Props {
  university: University;
}

export default function UniversityCard({
  university,
}: Props) {
  return (
    <div className="rounded-3xl border p-8 text-center transition hover:border-blue-500 hover:shadow-lg">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-600">
        <FaUniversity />
      </div>

      <h3 className="text-xl font-bold">
        {university.name}
      </h3>

      <p className="mt-2 text-gray-500">
        {university.location}
      </p>
    </div>
  );
}