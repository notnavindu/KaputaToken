<script context="module">
	export async function load() {
		const infuraProvider = new ethers.providers.InfuraProvider(
			'rinkeby',
			'7d4dc4226fe148fc802dfb6b43c2bae6'
		);

		const tokenContract = new ethers.Contract(
			TOKEN_ADDRESS,
			tokenContractBuild.abi,
			infuraProvider
		);
		const tokenSaleContract = new ethers.Contract(
			TOKEN_SALE_ADDRESS,
			tokenSaleBuild.abi,
			infuraProvider
		);

		let tokenPrice = ethers.utils.formatEther(
			ethers.BigNumber.from(await tokenSaleContract.tokenPrice()).toNumber()
		);

		let tokensAvailable = ethers.BigNumber.from(
			await tokenContract.balanceOf(TOKEN_SALE_ADDRESS)
		).toNumber();

		return {
			props: {
				tokenPrice: tokenPrice,
				tokensAvailable: tokensAvailable
			}
		};
	}
</script>

<script>
	import { fade } from 'svelte/transition';

	import tokenContractBuild from '../../../build/contracts/KaputaToken.json';
	import tokenSaleBuild from '../../../build/contracts/KaputaTokenSale.json';
	import { ethers } from 'ethers';
	import { onMount } from 'svelte';

	import KaputaIcon from '../icons/kaputaIcon.svelte';
	import { TOKEN_ADDRESS, TOKEN_SALE_ADDRESS } from '../constants/addresses';

	let loading = true;
	let web3Loading = true;
	let numberOfTokens = 1;
	let fadeThreshold = 99;

	let txnPending = false;
	let txnSuccessful = false;
	let txnHash = '';

	// public values
	export let tokenPrice = '...';
	export let tokensAvailable = 0;

	onMount(async () => {
		fadeThreshold = Math.floor(tokensAvailable / 5000);

		loading = false;
		web3Loading = false;
	});

	const buyTokens = async () => {
		web3Loading = true;

		// @ts-ignore
		if (typeof window.ethereum === 'undefined') {
			alert('You Need Metamask to buy tokens');
			return;
		}

		if (numberOfTokens == 0) return;

		// @ts-ignore
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		let signer;
		try {
			await provider.send('eth_requestAccounts', []);
			signer = await provider.getSigner();
			let network = await provider.getNetwork();

			if (network.name !== 'rinkeby') {
				alert('You must be in the rinkeby network');
				web3Loading = false;
				return;
			}
		} catch (error) {
			if (error.code === 4001) {
				alert("Don't be a Gota and accept the request!");
				return;
			}

			alert(error.message);
			web3Loading = true;
		}

		const tokenSaleContract = new ethers.Contract(TOKEN_SALE_ADDRESS, tokenSaleBuild.abi, signer);

		let price = parseFloat(tokenPrice) * numberOfTokens;

		tokenSaleContract
			.buyTokens(numberOfTokens, {
				value: ethers.utils.parseUnits(price.toString(), 'ether')
			})
			.then(
				(transaction) => {
					txnPending = true;
					txnHash = transaction.hash;

					transaction.wait().then((reciept) => {
						txnPending = false;
						txnSuccessful = true;
						web3Loading = false;
					});
				},
				(error) => {
					if (error.code === 4001) {
						alert("Don't be a Gota and accept the request!");

						return;
					} else {
						alert(error.message);
					}
					web3Loading = false;
				}
			);
	};
</script>

<main class="w-full min-h-screen py-8 px-4 flex flex-col items-center bg-zinc-100">
	<div class="text-4xl font-bold">
		<a
			href="https://youtu.be/lSpFnlOM5aw?t=40"
			class="underline underline-offset-2 cursor-pointer"
			target="_blank"
		>
			$KAPUTA
		</a> Token ICO
	</div>
	<div class="text-sm">A completely useless cryptocurrency.</div>

	<div class="mt-8 text-2xl">1 $KAPUTA = {tokenPrice} ETH</div>

	<div class="mt-4 mb-8 text-sm opacity-70">
		{tokensAvailable.toLocaleString()} $KAPUTAs available out of 500,000 $KAPUTAs
	</div>

	{#if !loading}
		<div class="grid grid-cols-10 grid-rows-6 gap-2">
			{#each Array(100).fill(0) as _, i}
				<div
					transition:fade={{ delay: 20 * i, duration: 1000 }}
					class:opacity-40={i >= fadeThreshold}
				>
					<KaputaIcon />
				</div>
			{/each}
		</div>
	{/if}

	<div class="flex items-center text-sm font-bold mt-4">
		<KaputaIcon />
		<div class="pl-2">= 5000 $KAPUTA</div>
	</div>

	<div class="mt-8 flex flex-col items-center justify-center">
		<input type="number" placeholder="1" class="border-2 p-2" bind:value={numberOfTokens} />
		<button
			class="mt-2 rounded-sm bg-zinc-700 text-white font-bold px-6 py-2"
			disabled={web3Loading}
			class:opacity-50={web3Loading}
			on:click={buyTokens}
		>
			Buy Tokens
		</button>
		<div class="text-xs opacity-50 mt-2">Rinkeby Network Only</div>
	</div>

	{#if txnPending}
		<div class="w-full max-w-sm bg-black text-yellow-500 p-4 text-center mt-4 rounded-xl ">
			<div class="w-full font-bold text-xl mb-3 flex items-center justify-center gap-4 ">
				<div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
				Transaction Pending
			</div>
			<a
				href={`https://rinkeby.etherscan.io/tx/${txnHash}`}
				target="_blank"
				class="font-bold underline underline-offset-2 text-white cursor-pointer"
			>
				View on Etherscan
			</a>
		</div>
	{/if}

	{#if txnSuccessful}
		<div class="w-full max-w-sm bg-black text-green-500 p-4 text-center mt-4 rounded-xl ">
			<div class="w-full font-bold text-xl mb-3 flex items-center justify-center gap-4 ">
				$KAPUTA Recieved
			</div>
			<a
				href={`https://rinkeby.etherscan.io/tx/${txnHash}`}
				target="_blank"
				class="font-bold underline underline-offset-2 text-white cursor-pointer"
			>
				View on Etherscan
			</a>
		</div>
	{/if}

	<div class="w-full max-w-xs text-center mt-24 text-xs opacity-40">
		Check out the source code on
		<a class="underline font-bold" href="https://github.com/notnavindu/KaputaToken"> GitHub </a>
		<br />
		#GoHomeGota
	</div>
</main>
