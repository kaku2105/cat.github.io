import { Experiments } from '@wix/thunderbolt-symbols'

export default function shouldExposeNewDashboardSdk({
	experiments,
	locationHref,
}: {
	experiments: Experiments
	locationHref: string
}) {
	const isDashbordSdkAvailable = new URL(locationHref).searchParams.get('dashboardSdkAvailable') === 'true'
	return (
		isDashbordSdkAvailable &&
		(Boolean(experiments['specs.thunderbolt.exposeNewDashboardSdkWithVelo']) ||
			Boolean(experiments['specs.thunderbolt.exposeNewDashboardSdkWithVelo_loggedIn']))
	)
}
