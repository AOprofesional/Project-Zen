/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                // Capture any id that is not literally "project"
                source: '/dashboard/clients/:id((?!project|page).*)',
                destination: '/dashboard/clients/project?id=:id',
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
