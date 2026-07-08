import type { ToolId } from './gameTools';

import queryIcon from './images/tools/tool_query.png';
import queryIconHi from './images/tools/tool_queryhi.png';
import bulldozeIcon from './images/tools/tool_bulldozer.png';
import bulldozeIconHi from './images/tools/tool_bulldozerhi.png';
import wireIcon from './images/tools/tool_wire.png';
import wireIconHi from './images/tools/tool_wirehi.png';
import roadIcon from './images/tools/tool_road.png';
import roadIconHi from './images/tools/tool_roadhi.png';
import railIcon from './images/tools/tool_railroad.png';
import railIconHi from './images/tools/tool_railroadhi.png';
import parkIcon from './images/tools/tool_park.png';
import parkIconHi from './images/tools/tool_parkhi.png';
import resIcon from './images/tools/tool_residential.png';
import resIconHi from './images/tools/tool_residentialhi.png';
import comIcon from './images/tools/tool_commercial.png';
import comIconHi from './images/tools/tool_commercialhi.png';
import indIcon from './images/tools/tool_industrial.png';
import indIconHi from './images/tools/tool_industrialhi.png';
import policeIcon from './images/tools/tool_policestation.png';
import policeIconHi from './images/tools/tool_policestationhi.png';
import fireIcon from './images/tools/tool_firestation.png';
import fireIconHi from './images/tools/tool_firestationhi.png';
import seaportIcon from './images/tools/tool_seaport.png';
import seaportIconHi from './images/tools/tool_seaporthi.png';
import coalIcon from './images/tools/tool_coalpower.png';
import coalIconHi from './images/tools/tool_coalpowerhi.png';
import stadiumIcon from './images/tools/tool_stadium.png';
import stadiumIconHi from './images/tools/tool_stadiumhi.png';
import nuclearIcon from './images/tools/tool_nuclearpower.png';
import nuclearIconHi from './images/tools/tool_nuclearpowerhi.png';
import airportIcon from './images/tools/tool_airport.png';
import airportIconHi from './images/tools/tool_airporthi.png';

export interface ToolIconSet {
	icon: string;
	iconHi: string;
}

/** Classic SimCity toolbar art (documentation/openlaszlo/resources/images). */
export const TOOL_ICONS: Record<ToolId, ToolIconSet> = {
	query: { icon: queryIcon, iconHi: queryIconHi },
	bulldoze: { icon: bulldozeIcon, iconHi: bulldozeIconHi },
	wire: { icon: wireIcon, iconHi: wireIconHi },
	road: { icon: roadIcon, iconHi: roadIconHi },
	rail: { icon: railIcon, iconHi: railIconHi },
	park: { icon: parkIcon, iconHi: parkIconHi },
	res: { icon: resIcon, iconHi: resIconHi },
	com: { icon: comIcon, iconHi: comIconHi },
	ind: { icon: indIcon, iconHi: indIconHi },
	police: { icon: policeIcon, iconHi: policeIconHi },
	fire: { icon: fireIcon, iconHi: fireIconHi },
	seaport: { icon: seaportIcon, iconHi: seaportIconHi },
	coal: { icon: coalIcon, iconHi: coalIconHi },
	stadium: { icon: stadiumIcon, iconHi: stadiumIconHi },
	nuclear: { icon: nuclearIcon, iconHi: nuclearIconHi },
	airport: { icon: airportIcon, iconHi: airportIconHi }
};
