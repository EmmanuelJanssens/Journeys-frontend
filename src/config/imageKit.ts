import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMK_PUBKEY,
    urlEndpoint: import.meta.env.VITE_IMK_ENDPOINT,
    privateKey: import.meta.env.VITE_IMK_PRIVKEY
});

export default imagekit;
