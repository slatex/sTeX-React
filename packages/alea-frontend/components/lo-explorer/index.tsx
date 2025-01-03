import { Box, Button, Chip, Typography } from '@mui/material';
import { ALL_LO_TYPES, AllLoRelationTypes, LoType } from '@stex-react/api';
import { localStore } from '@stex-react/utils';
import React, { useEffect, useMemo, useState } from 'react';
import styles from '../../styles/lo-explorer.module.scss';
import LoListDisplay, { getUrlInfo } from '../LoListDisplay';
import LoCartModal, { CartItem } from './LoCartModal';
import LoFilterAndSearch from './LoFilterAndSearch';
export interface ArchiveMap {
  archive: string;
  archiveUrl: string;
}

type FilterName = 'Mode' | 'LO' | 'Archive' | 'Relations';
const FilterChipList = ({
  label,
  items,
  setItems,
}: {
  label: FilterName;
  items: string[];
  setItems: any;
}) => {
  console.log({ setItems });
  const bgcolor =
    label === 'Mode'
      ? '#b3e5fc'
      : label === 'LO'
      ? '#fbe9e7'
      : label === 'Archive'
      ? '#c8e6c9'
      : 'rgba(224, 224, 224, 0.4)';

  return items.map((item) => {
    const { icon, projectName } =
      label === 'Archive' ? getUrlInfo(item) : { icon: null, projectName: null };
    return (
      <Chip
        key={item}
        label={
          label === 'Archive' ? (
            <Box display="flex" alignItems="center" gap="5px">
              <Typography variant="body2">{`${label}:`}</Typography>
              {icon}
              <Typography variant="body2">{projectName}</Typography>
            </Box>
          ) : (
            `${label}: ${item}`
          )
        }
        onDelete={() => {
          console.log('Items before update:', items);
          const updatedItems = items.filter((v) => v !== item);
          console.log('Updated Items:', updatedItems);
          setItems(updatedItems);
        }}
        // onDelete={() => setItems((prev) => prev.filter((v) => v !== item))}
        sx={{ m: 0.5, bgcolor }}
      />
    );
  });
};

const getFilteredUris = (
  loType: LoType,
  loUris: Record<LoType, string[]>,
  chosenArchives: string[]
): string[] => {
  const uris = loUris[loType] || [];
  if (chosenArchives.length > 0) {
    return uris.filter((uri) => {
      const { projectName } = getUrlInfo(uri);
      return chosenArchives.some((archive) => archive.toLowerCase() === projectName?.toLowerCase());
    });
  }
  return uris;
};

export function LoExplorer() {
  const [chosenRelations, setChosenRelations] = useState<AllLoRelationTypes[]>([]);
  const [chosenLoTypes, setChosenLoTypes] = useState<LoType[]>([]);
  const [chosenArchivesMap, setChosenArchivesMap] = useState<ArchiveMap[]>([]);
  const [loUris, setLoUris] = useState<Record<LoType, string[]>>({
    definition: [],
    problem: [],
    example: [],
    para: [],
    statement: [],
  });
  const [selectedUri, setSelectedUri] = useState('');
  const [selectedLo, setSelectedLo] = useState<LoType>('problem');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const filteredUris = useMemo(() => {
    const chosenArchives = chosenArchivesMap.map((item) => item.archive);
    return getFilteredUris(selectedLo, loUris, chosenArchives);
  }, [selectedLo, loUris, chosenArchivesMap]);

  const uniqueArchivesMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.keys(loUris).forEach((loType) => {
      const currentUris = loUris[loType as LoType] || [];
      currentUris.forEach((uri) => {
        const projectName = getUrlInfo(uri)?.projectName;
        if (projectName && !map[projectName]) {
          map[projectName] = uri;
        }
      });
    });
    return map;
  }, [loUris]);

  useEffect(() => {
    setSelectedUri(filteredUris.length > 0 ? filteredUris[0] : '');
  }, [filteredUris]);

  useEffect(() => {
    const storedCart = JSON.parse(localStore?.getItem('lo-cart')) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    localStore?.setItem('lo-cart', JSON.stringify(cart));
  }, [cart]);

  const filteredCounts = useMemo(() => {
    const counts: Record<LoType, number> = {
      definition: 0,
      problem: 0,
      example: 0,
      para: 0,
      statement: 0,
    };
    ALL_LO_TYPES.forEach((loType) => {
      const chosenArchives = chosenArchivesMap.map((item) => item.archive);
      counts[loType] = getFilteredUris(loType, loUris, chosenArchives).length;
    });
    return counts;
  }, [loUris, chosenArchivesMap]);

  let totalFilteredCount = 0;
  ALL_LO_TYPES.forEach((lo) => {
    totalFilteredCount += filteredCounts[lo] || 0;
  });

  const handleAddToCart = (uri: string, uriType: LoType) => {
    const uriWithTypeObj = { uri, uriType };
    const existsInCart = cart.some((item) => item.uri === uri && item.uriType === uriType);
    if (!existsInCart) {
      setCart((prev) => [...prev, uriWithTypeObj]);
    }
  };

  const handleRemoveFromCart = (uri: string, uriType: LoType) => {
    setCart((prev) => prev.filter((item) => !(item.uri === uri && item.uriType === uriType)));
  };

  return (
    <Box className={styles.outerBox}>
      <LoFilterAndSearch
        uniqueArchivesMap={uniqueArchivesMap}
        chosenArchivesMap={chosenArchivesMap}
        setChosenArchivesMap={setChosenArchivesMap}
        chosenRelations={chosenRelations}
        setChosenRelations={setChosenRelations}
        chosenLoTypes={chosenLoTypes}
        setChosenLoTypes={setChosenLoTypes}
        setShowCart={setShowCart}
        setLoUris={setLoUris}
      />

      {(!!chosenRelations.length || !!chosenLoTypes.length || !!chosenArchivesMap.length) && (
        <Box className={styles.filterChipListBox}>
          <FilterChipList label="Relations" items={chosenRelations} setItems={setChosenRelations} />
          <FilterChipList label="LO" items={chosenLoTypes} setItems={setChosenLoTypes} />
          <FilterChipList
            label="Archive"
            items={chosenArchivesMap.map((item) => item.archiveUrl)}
            setItems={(updatedItems) => {
              console.log({ updatedItems });
              setChosenArchivesMap((prev) => {
                console.log({ prev });
                return prev.filter((item) => updatedItems.includes(item.archiveUrl));
              });
            }}
          />
        </Box>
      )}

      {totalFilteredCount >= 300 && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 2 }}>
          Search result is limited to 300. Add more filters to narrow down your search.
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, width: '100%', flexWrap: 'wrap' }}>
        {(chosenLoTypes.length ? chosenLoTypes : ALL_LO_TYPES).map((lo) => (
          <Button
            key={lo}
            variant={selectedLo === lo ? 'contained' : 'outlined'}
            sx={{ '&:hover': { backgroundColor: 'primary.light', color: 'white' } }}
            onClick={() => setSelectedLo(lo)}
          >
            ({lo} {filteredCounts[lo] || 0})
          </Button>
        ))}
      </Box>

      <LoListDisplay
        uris={filteredUris}
        loType={selectedLo}
        cart={cart}
        selectedUri={selectedUri}
        setSelectedUri={setSelectedUri}
        handleAddToCart={handleAddToCart}
        handleRemoveFromCart={handleRemoveFromCart}
      />

      <LoCartModal
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        handleRemoveFromCart={handleRemoveFromCart}
      />
    </Box>
  );
}
