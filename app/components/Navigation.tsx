import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="my-8 mx-8 flex items-center justify-between md:space-x-10">
      <div>
        <h1 className="text-xl">GrubRun</h1>
      </div>
      <div>
        <ul className="flex">
          <li className="mr-6 text-lg">
            <Link href="/">Home</Link>
          </li>
          <li className="mr-6 text-lg">
            <Link href="/about">About</Link>
          </li>
          <li className="mr-6 text-lg">
            <Link href="/repo">Repo</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
