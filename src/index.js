import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

const domain = window.location.host;
const origin = window.location.origin;
const provider = new BrowserProvider(window.ethereum);
const providerTrust = new BrowserProvider(window.trustwallet);

const BACKEND_ADDR = "http://localhost:3000/api/v2/authentication";
async function createSiweMessage(address, statement) {
    const res = await fetch(`${BACKEND_ADDR}/nonce`, {
        credentials: 'include',
    });
    const message = new SiweMessage({
        domain,
        address,
        statement,
        uri: origin,
        version: '1',
        chainId: '56',
        nonce: await res.text()
    });
    return message.prepareMessage();
}

function connectWallet() {
    provider.send('eth_requestAccounts', [])
        .catch(() => console.log('user rejected request'));
}

async function signInWithEthereum() {
    const signer = await provider.getSigner();

    const message = await createSiweMessage(
        await signer.getAddress(),
        'Welcome to Seedify'
    );
    const signature = await signer.signMessage(message);

    const res = await fetch(`${BACKEND_ADDR}/authenticate-user`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
        credentials: 'include'
    });
    console.log(await res.text());
}

async function signInWithTrustWallet() {
    const signer = await providerTrust.getSigner();

    const message = await createSiweMessage(
        await signer.getAddress(),
        'Welcome to Seedify'
    );
    const signature = await signer.signMessage(message);

    const res = await fetch(`${BACKEND_ADDR}/authenticate-user`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, signature }),
        credentials: 'include'
    });
    console.log(await res.text());
}

async function getInformation() {
    const res = await fetch(`${BACKEND_ADDR}/current-user`, {
        credentials: 'include',
    });
    console.log(await res.text());
}


const siweBtn = document.getElementById('siweBtn');
const trustBtn = document.getElementById('trustBtn');
const infoBtn = document.getElementById('infoBtn');

siweBtn.onclick = signInWithEthereum;
trustBtn.onclick = signInWithTrustWallet;
infoBtn.onclick = getInformation;
