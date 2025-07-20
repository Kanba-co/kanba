export default function TestFooPage({ params }: { params: { foo: string } }) {
  return <div>Test dynamic route: {params.foo}</div>;
} 