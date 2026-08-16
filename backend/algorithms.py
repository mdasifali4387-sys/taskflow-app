# backend/algorithms.py

def insertion_sort(records: list, key: str) -> None:
    """
    Sorts a list of dictionaries in-place by the value at record[key].
    Mutates the records list directly and does not return anything.
    """
    n = len(records)
    for i in range(1, n):
        key_item = records[i]
        j = i - 1
        while j >= 0 and records[j][key] > key_item[key]:
            records[j + 1] = records[j]
            j -= 1
        records[j + 1] = key_item
    return  # Bare return as requested

def binary_search(sorted_records: list, target_value, key: str) -> int:
    """
    Operates on a pre-sorted list and returns the index of a record
    where record[key] == target_value. Returns -1 if absent.
    """
    low = 0
    high = len(sorted_records) - 1

    while low <= high:
        mid = (low + high) // 2
        current_value = sorted_records[mid][key]

        if current_value == target_value:
            return mid
        elif current_value < target_value:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

def linear_search(records: list, target_value, key: str) -> int:
    """
    Scans every record in order and returns the index of the first match,
    or -1 if absent.
    """
    for index, record in enumerate(records):
        if record[key] == target_value:
            return index
    return -1


# --- COUNTING WRAPPERS FOR BENCHMARKING (TASK 5) ---

def insertion_sort_count(records: list, key: str) -> int:
    """Sorts records in-place and returns the total comparison count."""
    comparisons = 0
    n = len(records)
    for i in range(1, n):
        key_item = records[i]
        j = i - 1
        while j >= 0:
            comparisons += 1
            if records[j][key] > key_item[key]:
                records[j + 1] = records[j]
                j -= 1
            else:
                break
        records[j + 1] = key_item
    return comparisons

def binary_search_count(sorted_records: list, target_value, key: str) -> dict:
    """Returns a dictionary with 'index' and 'comparison_count'."""
    comparisons = 0
    low = 0
    high = len(sorted_records) - 1
    found_index = -1

    while low <= high:
        comparisons += 1
        mid = (low + high) // 2
        current_value = sorted_records[mid][key]

        if current_value == target_value:
            found_index = mid
            break
        elif current_value < target_value:
            low = mid + 1
        else:
            high = mid - 1

    return {"index": found_index, "comparison_count": comparisons}

def linear_search_count(records: list, target_value, key: str) -> dict:
    """Returns a dictionary with 'index' and 'comparison_count'."""
    comparisons = 0
    found_index = -1
    
    for index, record in enumerate(records):
        comparisons += 1
        if record[key] == target_value:
            found_index = index
            break
            
    return {"index": found_index, "comparison_count": comparisons}
